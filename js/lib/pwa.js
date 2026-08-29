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
      swRegistration = await navigator.serviceWorker.register(swPath, { scope: '../' });
      return swRegistration;
    } catch (err) {
      console.warn('Erro ao registrar Service Worker:', err);
      return null;
    }
  }
  return null;
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
    return { ok: false, status: 'unsupported', erro: 'Seu navegador não suporta notificações.' };
  }

  // Se o navegador já possuir a permissão concedida, reativa diretamente
  if (Notification.permission === 'granted') {
    localStorage.setItem('reciclagem_notificacoes_ativas', 'true');
    iniciarMonitoramentoColetasRealtime();
    window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: 'granted' } }));
    return { ok: true, status: 'granted' };
  }

  // Se estiver bloqueado no navegador, orienta como desbloquear
  if (Notification.permission === 'denied') {
    localStorage.setItem('reciclagem_notificacoes_ativas', 'false');
    if (realtimeChannel) {
      try { supabase.removeChannel(realtimeChannel); } catch (e) {}
      realtimeChannel = null;
    }
    window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: 'denied' } }));
    return { 
      ok: false, 
      status: 'denied', 
      erro: 'Notificações bloqueadas no navegador. Para reativar, clique no ícone ao lado do link na barra de endereços do navegador e ative a chave de "Notificações" (ou clique em "Repor autorização").' 
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
      if (realtimeChannel) {
        try { supabase.removeChannel(realtimeChannel); } catch (e) {}
        realtimeChannel = null;
      }
      window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: permissao } }));
      return { 
        ok: false, 
        status: permissao, 
        erro: 'Permissão não concedida. Se desejar receber avisos, permita as notificações no navegador.' 
      };
    }
  } catch (err) {
    console.error('Erro ao solicitar permissão de notificações:', err);
    return { ok: false, status: 'error', erro: err.message };
  }
}

/**
 * Desativa notificações nas preferências locais e encerra conexão realtime
 */
export function desativarNotificacoes() {
  localStorage.setItem('reciclagem_notificacoes_ativas', 'false');
  if (realtimeChannel) {
    try {
      supabase.removeChannel(realtimeChannel);
    } catch (e) {}
    realtimeChannel = null;
  }
  window.dispatchEvent(new CustomEvent('notificacao-status-alterado', { detail: { status: 'disabled_by_user' } }));
  return { ok: true, status: 'disabled_by_user' };
}

/**
 * Dispara uma notificação para o usuário (via Service Worker ou Notification API)
 */
export async function dispararNotificacao({ title, body, url }) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  if (localStorage.getItem('reciclagem_notificacoes_ativas') === 'false') {
    return;
  }

  const iconPath = window.location.pathname.includes('/pages/') ? '../assets/icon-192.png' : './assets/icon-192.png';
  const targetUrl = url || (window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html');

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
      console.warn('Erro ao disparar notificação via ServiceWorker, tentando fallback:', e);
    }
  }

  // Fallback nativo
  try {
    const notif = new Notification(title, {
      body,
      icon: iconPath
    });
    notif.onclick = () => {
      window.focus();
      window.location.href = targetUrl;
    };
  } catch (e) {
    console.warn('Erro ao instanciar notificação nativa:', e);
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
          if (getStatusNotificacao() === 'granted') {
            await dispararNotificacao({
              title: 'Nova Oferta de Material!',
              body: 'Um novo material reciclável foi disponibilizado para coleta.',
              url: window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coleta' },
        async (payload) => {
          if (payload.new && payload.new.cod_status === 1 && payload.old && payload.old.cod_status !== 1) {
            if (getStatusNotificacao() === 'granted') {
              await dispararNotificacao({
                title: 'Oferta Redisponibilizada!',
                body: 'Um material reciclável foi reaberto e está disponível para coleta.',
                url: window.location.pathname.includes('/pages/') ? './catador-materiais.html' : './pages/catador-materiais.html'
              });
            }
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

// Auto-inicialização do Service Worker e Realtime se notificações estiverem ativas
if (typeof window !== 'undefined') {
  registrarServiceWorker();
  if (getStatusNotificacao() === 'granted') {
    iniciarMonitoramentoColetasRealtime();
  }
}
