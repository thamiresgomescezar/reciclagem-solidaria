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

/**
 * Inicia a escuta em tempo real no Supabase para notificar novas ofertas
 */
export function iniciarMonitoramentoColetasRealtime() {
  if (realtimeChannel) return;

  try {
    realtimeChannel = supabase
      .channel('coletas_push_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'coleta' },
        async (payload) => {
          const qtd = payload.new?.quantidade || 'Novo lote';
          await dispararNotificacao({
            title: '📦 Nova Oferta de Material!',
            body: `Um material reciclável (${qtd}) foi disponibilizado para coleta.`,
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
            const qtd = payload.new?.quantidade || 'Material reciclável';
            const eraCancelamentoCatador = Boolean(payload.old?.catador_id);

            const titulo = eraCancelamentoCatador
              ? '♻️ Coleta Disponível Novamente!'
              : '♻️ Oferta Redisponibilizada!';

            const mensagem = eraCancelamentoCatador
              ? `O agendamento anterior foi cancelado e a oferta (${qtd}) foi liberada para retirada.`
              : `Uma oferta (${qtd}) foi reaberta e está disponível para coleta.`;

            await dispararNotificacao({
              title: titulo,
              body: mensagem,
              url: window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html'
            });
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Não foi possível conectar ao canal Realtime do Supabase:', err);
  }
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

