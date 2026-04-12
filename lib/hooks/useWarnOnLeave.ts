import { useEffect } from "react"

export function useWarnOnLeave(
    isRunning: boolean,
    onReturnWithTime?: (secondsAway: number) => void
) {
    useEffect(() => {
        if (!isRunning) return

        function handleBeforeUnload(e: BeforeUnloadEvent) {
            e.preventDefault()
            e.returnValue = "El cronómetro está corriendo. Si sales perderás la sesión actual."
            return e.returnValue
        }

        function handleVisibilityChange() {
            if (document.visibilityState === "hidden") {
                localStorage.setItem("pomodoro_hidden_at", Date.now().toString())
            } else if (document.visibilityState === "visible") {
                const hiddenAt = localStorage.getItem("pomodoro_hidden_at")
                if (hiddenAt) {
                    const secondsAway = Math.floor((Date.now() - parseInt(hiddenAt)) / 1000)
                    localStorage.removeItem("pomodoro_hidden_at")
                    if (secondsAway > 3 && onReturnWithTime) {
                        onReturnWithTime(secondsAway)
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
    }, [isRunning, onReturnWithTime])
}