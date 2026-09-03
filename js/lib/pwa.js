import { supabase } from './supabaseClient.js';

let swRegistration = null;
let deferredInstallPrompt = null;
let realtimeChannel = null;

/**
 * Registra o Service Worker do PWA
 */
export async function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const swPath = window.location.pathname.includes('/pages/') ? '../sw.js' : './sw.js';
      swRegistration = await navigator.serviceWorker.register(swPath);
      return swRegistration;
    } catch (err) {
      console.warn('Erro ao registrar Service Worker:', err);
      return null;
    }
  }
  return null;
}

/**
 * Toca um aviso sonoro agradável e suave sintetizado via Web Audio API (0 arquivos externos, 100% resiliente)
 */
export function tocarSomNotificacao() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // Nota Ré (D5)
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // Nota Lá (A5)
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {}
}

/**
 * Exibe um Toast Interativo no topo da aplicação
 */
export function exibirToastNotificacao({ title, body, url }) {
  tocarSomNotificacao();

  const anterior = document.getElementById('toast-notif-container');
  if (anterior) anterior.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-notif-container';
  toast.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    left: 16px;
    max-width: 460px;
    margin: 0 auto;
    z-index: 999999;
    background: linear-gradient(135deg, #1b6d24 0%, #2e7d32 100%);
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 16px;
    box-shadow: 0 10px 28px rgba(0,0,0,0.28);
    display: flex;
    align-items: center;
    gap: 14px;
    animation: slideDownToast 0.35s ease-out;
    font-family: inherit;
    border: 1.5px solid #a5d6a7;
  `;

  const targetUrl = url || (window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html');

  toast.innerHTML = `
    <div style="font-size: 1.6rem; color: #a5d6a7; flex-shrink: 0; background: rgba(255,255,255,0.15); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <i class="fa-solid fa-bell"></i>
    </div>
    <div style="flex: 1; min-width: 0;">
      <strong style="display: block; font-size: 0.96rem; line-height: 1.2; margin-bottom: 2px;">${title}</strong>
      <span style="display: block; font-size: 0.83rem; color: #e8f5e9; line-height: 1.35;">${body}</span>
      <div style="margin-top: 8px;">
        <a href="${targetUrl}" style="background: #ffffff; color: #1b6d24; text-decoration: none; padding: 5px 14px; border-radius: 999px; font-size: 0.8rem; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
          Ver Ofertas Disponíveis <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
    <button type="button" id="btn-fechar-toast" style="background: none; border: none; color: #ffffff; opacity: 0.8; font-size: 1.25rem; cursor: pointer; padding: 4px;" title="Fechar">✕</button>
  `;

  if (!document.getElementById('style-toast-anim')) {
    const st = document.createElement('style');
    st.id = 'style-toast-anim';
    st.textContent = `
      @keyframes slideDownToast {
        from { transform: translateY(-40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(st);
  }

  document.body.appendChild(toast);

  const btnFechar = toast.querySelector('#btn-fechar-toast');
  if (btnFechar) {
    btnFechar.addEventListener('click', () => toast.remove());
  }

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 500);
    }
  }, 9000);
}

/**
 * Verifica o status atual da permissão de notificações
 */
export function getStatusNotificacao() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  const prefLocal = localStorage.getItem('reciclagem_notificacoes_ativas');
  if (prefLocal === 'false') {
    return 'disabled_by_user';
  }
  return Notification.permission; // 'default', 'granted', 'denied'
}

/**
 * Solicita ao usuário a permissão para envio de notificações
 */
export async function solicitarPermissaoNotificacao() {
  if (!('Notification' in window)) {
    return { ok: false, status: 'unsupported', erro: 'Seu navegador não suporta notificações de sistema.' };
  }

  if (Notification.permission === 'granted') {
    localStorage.setItem('reciclagem_notificacoes_ativas', 'true');
    iniciarMonitoramentoColetasRealtime();
    window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: 'granted' } }));
    return { ok: true, status: 'granted' };
  }

  if (Notification.permission === 'denied') {
    localStorage.setItem('reciclagem_notificacoes_ativas', 'false');
    window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: 'denied' } }));
    return { 
      ok: false, 
      status: 'denied', 
      erro: 'Notificações bloqueadas no navegador. Clique no ícone de cadeado/configurações ao lado do endereço do site e permita as Notificações.' 
    };
  }

  try {
    const permissao = await Notification.requestPermission();
    if (permissao === 'granted') {
      localStorage.setItem('reciclagem_notificacoes_ativas', 'true');
      iniciarMonitoramentoColetasRealtime();
      window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: 'granted' } }));
      return { ok: true, status: 'granted' };
    } else {
      localStorage.setItem('reciclagem_notificacoes_ativas', 'false');
      window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: permissao } }));
      return { 
        ok: false, 
        status: permissao, 
        erro: 'Permissão não concedida. Se desejar receber avisos do sistema, permita as notificações no navegador.' 
      };
    }
  } catch (err) {
    console.error('Erro ao solicitar permissão de notificações:', err);
    return { ok: false, status: 'error', erro: err.message };
  }
}

/**
 * Desativa notificações nas preferências locais
 */
export function desativarNotificacoes() {
  localStorage.setItem('reciclagem_notificacoes_ativas', 'false');
  window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: 'disabled_by_user' } }));
  return { ok: true, status: 'disabled_by_user' };
}

/**
 * Dispara notificação com In-App Toast prioritário + Web Notification do Sistema Operacional (se permitido)
 */
export async function dispararNotificacao({ title, body, url }) {
  const targetUrl = url || (window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html');

  // Dispara o evento de nova coleta no cliente para que as telas reajam instantaneamente
  window.dispatchEvent(new CustomEvent('nova-coleta-disponibilizada', { detail: { title, body, url: targetUrl } }));

  // 1. Exibe SEMPRE o Toast In-App com áudio elegante
  exibirToastNotificacao({ title, body, url: targetUrl });

  // 2. Se houver permissão no navegador/PWA, dispara também a notificação de sistema operacional
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && localStorage.getItem('reciclagem_notificacoes_ativas') !== 'false') {
    const iconPath = window.location.pathname.includes('/pages/') ? '../assets/icon-192.png' : './assets/icon-192.png';

    if (swRegistration && 'showNotification' in swRegistration) {
      try {
        await swRegistration.showNotification(title, {
          body,
          icon: iconPath,
          badge: iconPath,
          vibrate: [200, 100, 200],
          data: { url: targetUrl }
        });
        return;
      } catch (e) {
        console.warn('Falha no ServiceWorker showNotification, usando Notification nativa:', e);
      }
    }

    try {
      const notif = new Notification(title, {
        body,
        icon: iconPath
      });
      notif.onclick = () => {
        window.focus();
        window.location.href = targetUrl;
      };
    } catch (e) {}
  }
}

// Mapa de estados de coletas conhecidas: id -> { disponivel: boolean, catador_id: string|null }
const coletasConhecidas = new Map();
let primeiraCargaConcluida = false;
let intervaloPolling = null;

const NOMES_MATERIAIS_PADRAO = {
  1: 'Papel',
  2: 'Plástico',
  3: 'Vidro',
  4: 'Metal',
  5: 'Material Reciclável'
};
const mapaMateriaisCarregados = new Map();

async function obterNomeMaterial(codMaterial, objMateriais) {
  if (objMateriais && objMateriais.tipo) return objMateriais.tipo;
  if (codMaterial && mapaMateriaisCarregados.has(codMaterial)) {
    return mapaMateriaisCarregados.get(codMaterial);
  }
  if (codMaterial && NOMES_MATERIAIS_PADRAO[codMaterial]) {
    return NOMES_MATERIAIS_PADRAO[codMaterial];
  }
  if (codMaterial) {
    try {
      const { data } = await supabase.from('materiais').select('tipo').eq('cod_material', codMaterial).maybeSingle();
      if (data?.tipo) {
        mapaMateriaisCarregados.set(codMaterial, data.tipo);
        return data.tipo;
      }
    } catch (e) {}
  }
  return 'Material Reciclável';
}

/**
 * Inicia a escuta em tempo real no Supabase para notificar novas ofertas
 * Utiliza sistema híbrido: WebSockets Realtime + Polling inteligente a cada 4 segundos.
 */
export function iniciarMonitoramentoColetasRealtime() {
  iniciarPollingContingencia();

  if (realtimeChannel) return;

  try {
    realtimeChannel = supabase
      .channel('coletas_push_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'coleta' },
        async (payload) => {
          const id = payload.new?.cod_coleta;
          if (id) {
            if (coletasConhecidas.has(id)) return;
            coletasConhecidas.set(id, { disponivel: true, catador_id: null });
          }
          const materialNome = await obterNomeMaterial(payload.new?.cod_material);
          await dispararNotificacao({
            title: 'Nova Oferta Disponível',
            body: `Há uma nova oferta de ${materialNome} disponível para retirada.`,
            url: window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html'
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coleta' },
        async (payload) => {
          const agoraDisponivel = payload.new && (payload.new.cod_status === 1 || payload.new.status === 'disponível') && !payload.new.catador_id;
          const eraOcupadoOuInativo = payload.old && (payload.old.cod_status !== 1 || payload.old.catador_id !== null);

          if (agoraDisponivel && eraOcupadoOuInativo) {
            const id = payload.new?.cod_coleta;
            if (id) {
              const jaNotificada = coletasConhecidas.get(id)?.disponivel === true;
              if (jaNotificada) return;
              coletasConhecidas.set(id, { disponivel: true, catador_id: null });
            }
            const materialNome = await obterNomeMaterial(payload.new?.cod_material);

            await dispararNotificacao({
              title: 'Coleta Disponível Novamente',
              body: `O agendamento foi cancelado e a oferta de ${materialNome} voltou a ficar disponível para retirada.`,
              url: window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html'
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Canal de coletas conectado via WebSocket.');
        } else if (err) {
          console.warn('[Realtime] Canal de coletas aviso:', status, err);
        }
      });
  } catch (err) {
    console.warn('Não foi possível conectar ao canal Realtime do Supabase:', err);
  }
}

/**
 * Polling de contingência a cada 4 segundos:
 * Garante entrega imediata das notificações tanto para NOVAS ofertas
 * quanto para ofertas CANCELADAS / REABERTAS que voltaram a ficar disponíveis!
 */
export function iniciarPollingContingencia() {
  if (intervaloPolling) return;

  const verificarColetas = async () => {
    if (localStorage.getItem('reciclagem_notificacoes_ativas') === 'false') return;

    try {
      const { data, error } = await supabase
        .from('coleta')
        .select('cod_coleta, cod_material, quantidade, cod_status, catador_id, criado_em, materiais:cod_material(tipo)')
        .order('criado_em', { ascending: false })
        .limit(20);

      if (!error && data) {
        if (!primeiraCargaConcluida) {
          // Na primeira carga, memoriza o status de cada coleta sem apitar
          data.forEach(item => {
            if (item.cod_coleta) {
              const statusVal = item.cod_status;
              const isDisp = (statusVal === 1 || statusVal === null || statusVal === undefined) && !item.catador_id;
              coletasConhecidas.set(item.cod_coleta, { disponivel: isDisp, catador_id: item.catador_id });
            }
          });
          primeiraCargaConcluida = true;
          return;
        }

        // Nas verificações seguintes a cada 4 segundos:
        for (const item of data) {
          const id = item.cod_coleta;
          if (!id) continue;
          const statusVal = item.cod_status;
          const isDisp = (statusVal === 1 || statusVal === null || statusVal === undefined) && !item.catador_id;
          const estadoAnterior = coletasConhecidas.get(id);

          // Cenário 1: Nova doação cadastrada agora pelo Cidadão
          if (!estadoAnterior) {
            coletasConhecidas.set(id, { disponivel: isDisp, catador_id: item.catador_id });
            if (isDisp) {
              const materialNome = await obterNomeMaterial(item.cod_material, item.materiais);
              await dispararNotificacao({
                title: 'Nova Oferta Disponível',
                body: `Há uma nova oferta de ${materialNome} disponível para retirada.`,
                url: window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html'
              });
            }
          } 
          // Cenário 2: Oferta cujo agendamento foi cancelado e voltou a ficar disponível!
          else if (isDisp && estadoAnterior.disponivel === false) {
            coletasConhecidas.set(id, { disponivel: isDisp, catador_id: item.catador_id });
            const materialNome = await obterNomeMaterial(item.cod_material, item.materiais);
            await dispararNotificacao({
              title: 'Coleta Disponível Novamente',
              body: `O agendamento foi cancelado e a oferta de ${materialNome} voltou a ficar disponível para retirada.`,
              url: window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html'
            });
          } else {
            // Atualiza o estado sem disparar notificação (ex: virou agendada)
            coletasConhecidas.set(id, { disponivel: isDisp, catador_id: item.catador_id });
          }
        }
      }
    } catch (err) {
      // Silencioso em caso de oscilação transitória
    }
  };

  // Executa imediatamente e depois a cada 4 segundos
  verificarColetas();
  intervaloPolling = setInterval(verificarColetas, 4000);
}

// Sincronização em tempo real caso o usuário mude as permissões nativas no navegador
if (typeof window !== 'undefined' && 'permissions' in navigator) {
  navigator.permissions.query({ name: 'notifications' }).then((permissionStatus) => {
    permissionStatus.onchange = () => {
      if (permissionStatus.state === 'denied' || permissionStatus.state === 'prompt') {
        desativarNotificacoes();
      } else if (permissionStatus.state === 'granted') {
        if (localStorage.getItem('reciclagem_notificacoes_ativas') !== 'false') {
          iniciarMonitoramentoColetasRealtime();
        }
      }
      window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: permissionStatus.state } }));
    };
  }).catch(() => {});
}

// Captura evento de instalação PWA
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-installable', { detail: e }));
});

export function podeInstalarPWA() {
  return !!deferredInstallPrompt;
}

export async function dispararInstalacaoPWA() {
  if (!deferredInstallPrompt) {
    return false;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome === 'accepted';
}

// Auto-inicialização do Service Worker e escuta Realtime
if (typeof window !== 'undefined') {
  registrarServiceWorker();
  iniciarMonitoramentoColetasRealtime();
}

