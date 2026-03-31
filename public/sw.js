self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const options = { body: data.body || "New update from JDS Clinic.", icon:"/icon-192.png", badge:"/icon-192.png", vibrate:[100,50,100], data:{ url: data.url || "/" } };
  event.waitUntil(self.registration.showNotification(data.title || "JDS Clinic", options));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
