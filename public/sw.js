const CACHE_NAME = "study-organizer-v1"
const urlsToCache = ["/", "/board", "/manifest.json", "/icon-192.png", "/icon-512.png"]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    )
    self.skipWaiting()
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    )
    self.clients.claim()
})

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    )
})

self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {}
    const title = data.title || "Study Organizer"
    const options = {
        body: data.body || "",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
        data: data,
        actions: data.actions || [],
    }
    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", function (event) {
    event.notification.close()
    event.waitUntil(
        clients.matchAll({ type: "window" }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && "focus" in client) return client.focus()
            }
            if (clients.openWindow) return clients.openWindow("/board")
        })
    )
})