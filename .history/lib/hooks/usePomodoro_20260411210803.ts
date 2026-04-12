import { useState, useEffect, useRef, useCallback } from "react"

export type PomodoroPhase = "focus" | "short_break" | "long_break" | "idle"

interface UsePomodoroProps {
    focusMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    sessionsBeforeLong: number
    onSessionComplete: (durationSeconds: number) => void
    onPhaseChange?: (phase: PomodoroPhase) => void
}

export function usePomodoro({
    focusMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    sessionsBeforeLong,
    onSessionComplete,
    onPhaseChange,
}: UsePomodoroProps) {
    const [phase, setPhase] = useState<PomodoroPhase>("idle")
    const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [completedSessions, setCompletedSessions] = useState(0)
    const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const sessionStartRef = useRef<number>(0)

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    // Cuando cambia focusMinutes resetea si está idle
    useEffect(() => {
        if (phase === "idle") {
            setSecondsLeft(focusMinutes * 60)
        }
    }, [focusMinutes, phase])

    useEffect(() => {
        if (!isRunning) return

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearTimer()
                    handleTimerEnd()
                    return 0
                }
                return prev - 1
            })
            setCurrentSessionSeconds((prev) => prev + 1)
        }, 1000)

        return () => clearTimer()
    }, [isRunning, phase])

    function handleTimerEnd() {
        if (phase === "focus" || phase === "idle") {
            const duration = currentSessionSeconds + 1
            onSessionComplete(duration)
            setCurrentSessionSeconds(0)

            const newCompleted = completedSessions + 1
            setCompletedSessions(newCompleted)

            const isLongBreak = newCompleted % sessionsBeforeLong === 0
            const nextPhase = isLongBreak ? "long_break" : "short_break"
            const nextSeconds = isLongBreak ? longBreakMinutes * 60 : shortBreakMinutes * 60

            setPhase(nextPhase)
            setSecondsLeft(nextSeconds)
            setIsRunning(true)
            onPhaseChange?.(nextPhase)
        } else {
            // Fin del descanso
            setPhase("focus")
            setSecondsLeft(focusMinutes * 60)
            setIsRunning(false)
            onPhaseChange?.("focus")
        }
    }

    function start() {
        if (phase === "idle") setPhase("focus")
        sessionStartRef.current = Date.now()
        setIsRunning(true)
    }

    function pause() {
        clearTimer()
        setIsRunning(false)

        // Guardar sesión si había tiempo corriendo
        if (currentSessionSeconds > 0) {
            onSessionComplete(currentSessionSeconds)
        }

        // Resetear cronómetro visual
        setCurrentSessionSeconds(0)
        setPhase("idle")
        setSecondsLeft(focusMinutes * 60)
    }

    function reset() {
        clearTimer()
        setIsRunning(false)
        setPhase("idle")
        setSecondsLeft(focusMinutes * 60)
        setCurrentSessionSeconds(0)
    }

    return {
        phase,
        secondsLeft,
        isRunning,
        completedSessions,
        currentSessionSeconds,
        start,
        pause,
        reset,
    }
}