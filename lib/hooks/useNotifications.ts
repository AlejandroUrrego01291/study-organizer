import { useEffect, useRef, useCallback } from "react"

export function useNotifications() {
    const swRegistration = useRef<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        async function registerSW() {
            if (!("serviceWorker" in navigator)) return
            try {
                const reg = await navigator.serviceWorker.register("/sw.js")
                swRegistration.current = reg
            } catch (err) {
                console.log("SW registration failed:", err)
            }
        }
        registerSW()
    }, [])

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!("Notification" in window)) return false
        if (Notification.permission === "granted") return true
        if (Notification.permission === "denied") return false
        const result = await Notification.requestPermission()
        return result === "granted"
    }, [])

    const sendNotification = useCallback(
        (title: string, body: string, options?: { vibrate?: boolean }) => {
            if (!("Notification" in window)) return
            if (Notification.permission !== "granted") return

            // Intentar con Service Worker primero (funciona en móvil con app en background)
            if (swRegistration.current) {
                swRegistration.current.showNotification(title, {
                    body,
                    icon: "/favicon.ico",
                    badge: "/favicon.ico",
                    vibrate: options?.vibrate ? [200, 100, 200, 100, 200] : [200],
                    tag: "pomodoro",
                    renotify: true,
                } as NotificationOptions)
            } else {
                // Fallback a Notification API normal
                new Notification(title, { body, icon: "/favicon.ico" })
            }
        },
        []
    )

    return { requestPermission, sendNotification }
}