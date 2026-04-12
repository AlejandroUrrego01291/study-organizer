self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {}
    const title = data.title || "Study Organizer"
    const options = {
        body: data.body || "",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
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