// Service Worker for Web Push Notifications & PWA
const CACHE_NAME = 'rgycsp-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push Notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'ABCD Edu Hub Notification',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'ABCD Edu Hub Notification';
  const options = {
    body: data.body || data.message || 'You have a new institutional notification.',
    icon: data.icon || 'https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp',
    badge: data.badge || 'https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || data.link || '/',
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: data.actions || [
      {
        action: 'open',
        title: 'Open Details',
      }
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open with the URL, focus it
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
