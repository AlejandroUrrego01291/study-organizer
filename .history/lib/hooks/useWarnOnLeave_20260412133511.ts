import { useEffect } from "react"

export function useWarnOnLeave(isRunning: boolean) {
    useEffect(() => {
        if (!isRunning) return

        // Advertencia al cerrar pestaña o navegar fuera del navegador
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            e.preventDefault()
            e.returnValue = "El cronómetro está corriendo. Si sales perderás la sesión actual."
            return e.returnValue
        }

        // Advertencia al bloquear pantalla en móvil (visibilidad)
        function handleVisibilityChange() {
            if (document.visibilityState === "hidden") {
                // Guardar timestamp para calcular tiempo perdido al volver
                localStorage.setItem("pomodoro_hidden_at", Date.now().toString())
            } else if (document.visibilityState === "visible") {
                const hiddenAt = localStorage.getItem("pomodoro_hidden_at")
                if (hiddenAt) {
                    const secondsAway = Math.floor((Date.now() - parseInt(hiddenAt)) / 1000)
                    localStorage.removeItem("pomodoro_hidden_at")
                    if (secondsAway > 5) {
                        const event = new CustomEvent("pomodoro_returned", { detail: { secondsAway } })
                        window.dispatchEvent(event)
                    }
                }
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [isRunning])
}