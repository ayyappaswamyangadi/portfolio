// Served as /sw.js on the apex domain (ayyappa.dev) only — see the rewrite in
// next.config.ts. The site lives on www now; a copy of the app installed from
// the apex before the redirect existed still runs an old service worker
// there, serving a frozen old build. This worker replaces it, deletes its
// caches, unregisters itself, and reloads open windows so they follow the
// redirect to the live site.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: "window" });
      await Promise.all(windows.map((client) => client.navigate(client.url)));
    })(),
  );
});
