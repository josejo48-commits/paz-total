// ============================================================
// PAZ TOTAL - SERVICE WORKER v28
// Notificaciones programadas sin servidor externo
// ============================================================

const CACHE = 'paz-total-v28';

const WELLNESS = [
  { icon:'💧', name:'Toma agua', sub:'Tus riñones te lo agradecerán. ¡Hidrátate!', interval: 60 },
  { icon:'🧘', name:'Pausa activa', sub:'Levántate, estira y respira 5 minutos', interval: 90 },
  { icon:'📞', name:'Llama a tu familia', sub:'Un momento de conexión hace bien al alma', interval: 480 },
  { icon:'🌿', name:'Sal a caminar', sub:'10 minutos al aire libre renueva tu energía', interval: 240 },
  { icon:'🙏', name:'Momento de oración', sub:'Detente un momento y habla con Jehová', interval: 180 },
  { icon:'😌', name:'Respira profundo', sub:'3 respiraciones lentas aclaran la mente', interval: 45 },
  { icon:'🍽️', name:'Hora de comer', sub:'Nutre tu cuerpo, es templo de Dios', interval: 360 },
  { icon:'👁️', name:'Descansa la vista', sub:'Mira a lo lejos 20 segundos', interval: 30 },
  { icon:'💪', name:'Toma tu vitamina', sub:'No olvides tu suplemento diario', interval: 1440 },
  { icon:'😴', name:'Prepárate para descansar', sub:'Tu cuerpo necesita recuperarse', interval: 720 },
];

// Install
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Manejar mensajes desde la app
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAll(e.data.times || {});
  }
  if (e.data && e.data.type === 'TEST_NOTIFICATION') {
    showNotification('🕊️ Paz Total', 'Las notificaciones funcionan correctamente ✅', '🕊️');
  }
});

function scheduleAll(savedTimes) {
  const now = Date.now();
  WELLNESS.forEach((w, i) => {
    const nextTime = savedTimes[i] ? parseInt(savedTimes[i]) : now + w.interval * 60000;
    const delay = Math.max(5000, nextTime - now);
    setTimeout(() => fireNotification(w, i, savedTimes), delay);
  });
}

function fireNotification(w, idx, savedTimes) {
  showNotification(w.icon + ' ' + w.name, w.sub, w.icon);
  // Notify the app to update times
  const newNext = Date.now() + w.interval * 60000;
  // Schedule next occurrence
  setTimeout(() => fireNotification(w, idx, savedTimes), w.interval * 60000);
  // Tell all open clients
  clients.matchAll().then(cs => {
    cs.forEach(c => c.postMessage({
      type: 'WELLNESS_DUE',
      idx: idx,
      name: w.name,
      sub: w.sub,
      icon: w.icon
    }));
  });
}

function showNotification(title, body, icon) {
  const options = {
    body: body,
    icon: '/paz-total/icons/icon-192.png',
    badge: '/paz-total/icons/icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: false,
    silent: false,
    tag: 'paz-total-' + Date.now(),
  };
  self.registration.showNotification(title, options);
}

// Manejar click en notificación
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cs => {
      if (cs.length > 0) {
        cs[0].focus();
      } else {
        clients.openWindow('/paz-total/');
      }
    })
  );
});

// Firebase background messages
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyALu4HDEYgAqCxdA3p-3XK6q01qXSuiLOo",
    authDomain: "paz-total-adea6.firebaseapp.com",
    projectId: "paz-total-adea6",
    messagingSenderId: "396671031069",
    appId: "1:396671031069:web:d0ddd4c6a9cabc8f6833f4"
  });

  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
    const { title, body } = payload.notification || {};
    showNotification(title || '🕊️ Paz Total', body || 'Tienes un recordatorio', '🕊️');
  });
} catch(e) {
  // Firebase no disponible, solo notificaciones locales
}
