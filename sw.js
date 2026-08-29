// Service Worker — Reciclagem Solidária
const CACHE_NAME = 'reciclagem-solidaria-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Evento de Recebimento de Push Notification
self.addEventListener('push', (event) => {
  let data = {
    title: 'Nova Oferta Disponível!',
    body: 'Um novo material reciclável foi disponibilizado para coleta.',
    url: './pages/catador-materiais.html'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || './pages/catador-materiais.html'
    },
    actions: [
      { action: 'open', title: 'Ver Materiais' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique na Notificação: Direciona diretamente para a tela de Materiais Disponíveis
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './pages/catador-materiais.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('catador-materiais.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clientList.length > 0 && 'navigate' in clientList[0]) {
        clientList[0].focus();
        return clientList[0].navigate(targetUrl);
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
