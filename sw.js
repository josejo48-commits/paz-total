// ============================================================
// PAZ TOTAL - SERVICE WORKER v29
// ============================================================
// IMPORTANTE: este service worker YA NO programa recordatorios
// con setTimeout internamente. Los navegadores apagan (terminan)
// el service worker tras ~30s sin actividad, así que un setTimeout
// de horas nunca llega a dispararse aquí de forma confiable — es
// una limitación del navegador, no del código. La programación
// de recordatorios ahora vive en index.html (setTimeout de página,
// funciona mientras la app está abierta/reciente en segundo plano).
//
// Este archivo se encarga de lo que SÍ puede hacer de forma
// confiable: mostrar la notificación en la barra del sistema
// (showNotification), reaccionar al clic, y recibir pushes reales
// de Firebase Cloud Messaging (lo único que puede despertar la app
// aunque esté completamente cerrada — pero requiere que un backend
// externo llame a la API de FCM; sin eso, esta parte queda lista
// pero inactiva).
// ============================================================

const CACHE = 'paz-total-v29';

// Debe coincidir EXACTO (mismo orden, mismos índices) con el
// arreglo WELLNESS de index.html, porque los mensajes de Firebase
// solo mandan el índice (idx), no el contenido.
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

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Mensajes desde la app (solo prueba manual; ya no programamos
// recordatorios de largo plazo aquí — ver nota arriba)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'TEST_NOTIFICATION') {
    showNotification('🕊️ Paz Total', 'Las notificaciones funcionan correctamente ✅', '🕊️');
  }
});

function showNotification(title, body, icon, idx) {
  const options = {
    body: body,
    icon: '/paz-total/icons/icon-192.png',
    badge: '/paz-total/icons/icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: false,
    silent: false,
    tag: 'paz-total-' + (idx !== undefined ? idx : Date.now()),
    renotify: true,
    data: { idx: idx, url: '/paz-total/' }
  };
  self.registration.showNotification(title, options);
}

// Clic en la notificación → abre o enfoca la app
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

// Firebase Cloud Messaging - push en segundo plano
// (solo se dispara si un backend externo envía un push real vía
// la API de FCM; obtener el token no es suficiente por sí solo)
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
    const idx = parseInt(payload.data?.idx || 0);
    const w = WELLNESS[idx] || { icon:'🕊️', name:'Paz Total', sub:'Tienes un recordatorio' };
    showNotification(w.icon + ' ' + w.name, w.sub, w.icon, idx);
  });
} catch(e) {
  // Firebase no disponible, solo notificaciones locales
}
