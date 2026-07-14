importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyALu4HDEYgAqCxdA3p-3XK6q01qXSuiLOo",
  authDomain: "paz-total-adea6.firebaseapp.com",
  projectId: "paz-total-adea6",
  storageBucket: "paz-total-adea6.firebasestorage.app",
  messagingSenderId: "396671031069",
  appId: "1:396671031069:web:d0ddd4c6a9cabc8f6833f4"
});

const messaging = firebase.messaging();

// Handle background messages - esto es lo que funciona con app cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);

  const { title, body, icon } = payload.notification || {};

  const notificationTitle = title || '🕊️ Paz Total';
  const notificationOptions = {
    body: body || 'Tienes un recordatorio pendiente',
    icon: icon || '/paz-total/icons/icon-192.png',
    badge: '/paz-total/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'paz-total-notification',
    renotify: true,
    actions: [
      { action: 'done',   title: '✅ Listo' },
      { action: 'snooze', title: '⏰ En 10 min' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'done') {
    // Mark as done - open app
    event.waitUntil(clients.openWindow('/paz-total/'));
  } else if (event.action === 'snooze') {
    // Just close, will remind later
    console.log('Snoozed');
  } else {
    event.waitUntil(clients.openWindow('/paz-total/'));
  }
});
