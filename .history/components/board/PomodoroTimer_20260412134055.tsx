"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { formatSeconds } from "@/lib/utils"
import toast from "react-hot-toast"
import { useWarnOnLeave } from "@/lib/hooks/useWarnOnLeave"

type PomodoroPhase = "focus" | "short_break" | "long_break" | "idle"

interface Props {
    cardId: string
    focusMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    sessionsBeforeLong: number
    totalStudySeconds: number
    onSessionSaved: (newTotal: number) => void
    onStatusChange: (status: "DOING") => void
}

const phaseConfig: Record<PomodoroPhase, { label: string; color: string; bg: string; stroke: string }> = {
    idle: { label: "Listo para comenzar", color: "text-indigo-600", bg: "bg-indigo-50", stroke: "#6366f1" },
    focus: { label: "🍅 Tiempo de enfoque", color: "text-emerald-600", bg: "bg-emerald-50", stroke: "#10b981" },
    short_break: { label: "☕ Descanso corto", color: "text-blue-600", bg: "bg-blue-50", stroke: "#3b82f6" },
    long_break: { label: "🛋️ Descanso largo", color: "text-purple-600", bg: "bg-purple-50", stroke: "#8b5cf6" },
}

export default function PomodoroTimer({
    cardId,
    focusMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    sessionsBeforeLong,
    totalStudySeconds,
    onSessionSaved,
    onStatusChange,
}: Props) {
    const [phase, setPhase] = useState<PomodoroPhase>("idle")
    const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [completedSessions, setCompletedSessions] = useState(0)
    const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0)
    const [savedTotal, setSavedTotal] = useState(totalStudySeconds)
    const [displayTotal, setDisplayTotal] = useState(totalStudySeconds)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    // Hook para advertir al usuario si intenta salir mientras el timer está corriendo
    useWarnOnLeave(isRunning)

    // Resetea segundosLeft si cambia focusMinutes y está idle
    useEffect(() => {
        if (phase === "idle") {
            setSecondsLeft(focusMinutes * 60)
        }
    }, [focusMinutes, phase])

    // Contador total en tiempo real
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRunning) {
            interval = setInterval(() => {
                setDisplayTotal((prev) => prev + 1)
            }, 1000)
        } else {
            setDisplayTotal(savedTotal)
        }
        return () => clearInterval(interval)
    }, [isRunning, savedTotal])

    // Detectar cuando el usuario regresa a la aplicación
    useEffect(() => {
        function handleReturned(e: Event) {
            const seconds = (e as CustomEvent).detail.secondsAway

            if (isRunning) {
                toast(
                    `📱 Estuviste fuera ${seconds}s. El cronómetro siguió corriendo.`,
                    { duration: 5000, icon: "⚠️" }
                )
                // Compensar el tiempo que estuvo fuera
                setCurrentSessionSeconds((prev) => prev + seconds)
                setSecondsLeft((prev) => Math.max(0, prev - seconds))
            }
        }

        window.addEventListener("pomodoro_returned", handleReturned)

        return () => window.removeEventListener("pomodoro_returned", handleReturned)
    }, [isRunning])

    async function saveSession(durationSeconds: number) {
        if (durationSeconds <= 0) return
        const res = await fetch(`/api/cards/${cardId}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ durationSeconds }),
        })
        if (res.ok) {
            const data = await res.json()
            const newTotal = data.card.totalStudySeconds
            setSavedTotal(newTotal)
            onSessionSaved(newTotal)
        }
    }

    function handleTimerEnd(
        currentPhase: PomodoroPhase,
        sessionSeconds: number,
        completed: number
    ) {
        if (currentPhase === "focus" || currentPhase === "idle") {
            saveSession(sessionSeconds)
            const newCompleted = completed + 1
            setCompletedSessions(newCompleted)
            setCurrentSessionSeconds(0)

            const isLongBreak = newCompleted % sessionsBeforeLong === 0
            if (isLongBreak) {
                toast("🛋️ ¡Completaste 4 pomodoros! Mereces un descanso largo.", { duration: 8000 })
                setPhase("long_break")
                setSecondsLeft(longBreakMinutes * 60)
            } else {
                toast("☕ ¡Buen trabajo! Toma un descanso de 5 minutos.", { icon: "🍅", duration: 6000 })
                setPhase("short_break")
                setSecondsLeft(shortBreakMinutes * 60)
            }
        } else {
            toast("🎯 ¡Descanso terminado! A enfocarse de nuevo.", { duration: 4000 })
            setPhase("focus")
            setSecondsLeft(focusMinutes * 60)
            setIsRunning(false)
        }
    }

    useEffect(() => {
        if (!isRunning) return

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearTimer()
                    setCurrentSessionSeconds((cs) => {
                        setCompletedSessions((comp) => {
                            setPhase((ph) => {
                                handleTimerEnd(ph, cs + 1, comp)
                                return ph
                            })
                            return comp
                        })
                        return cs
                    })
                    return 0
                }
                return prev - 1
            })
            setCurrentSessionSeconds((prev) => prev + 1)
        }, 1000)

        return () => clearTimer()
    }, [isRunning])

    function handleStart() {
        if (phase === "idle") setPhase("focus")
        setIsRunning(true)
        onStatusChange("DOING")
    }

    function handlePause() {
        clearTimer()
        setIsRunning(false)
        if (currentSessionSeconds > 0) {
            saveSession(currentSessionSeconds)
        }
        setCurrentSessionSeconds(0)
        setPhase("idle")
        setSecondsLeft(focusMinutes * 60)
    }

    function handleReset() {
        clearTimer()
        setIsRunning(false)
        setPhase("idle")
        setSecondsLeft(focusMinutes * 60)
        setCurrentSessionSeconds(0)
    }

    const config = phaseConfig[phase]

    const totalPhaseSeconds =
        phase === "focus" || phase === "idle"
            ? focusMinutes * 60
            : phase === "short_break"
                ? shortBreakMinutes * 60
                : longBreakMinutes * 60

    const progress = ((totalPhaseSeconds - secondsLeft) / totalPhaseSeconds) * 100
    const circumference = 2 * Math.PI * 54
    const strokeDashoffset = circumference - (progress / 100) * circumference
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60

    return (
        <div className="space-y-4">
            {/* Fase actual */}
            <div className={`rounded-xl p-3 text-center ${config.bg}`}>
                <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
                {completedSessions > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        🍅 {completedSessions} pomodoro{completedSessions !== 1 ? "s" : ""} completado{completedSessions !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {/* Cronómetro circular */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60" cy="60" r="54"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60" cy="60" r="54"
                            fill="none"
                            stroke={config.stroke}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 tabular-nums">
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </span>
                        <span className="text-xs text-gray-500">
                            {phase === "idle"
                                ? `${focusMinutes} min`
                                : phase === "focus"
                                    ? "enfoque"
                                    : "descanso"}
                        </span>
                    </div>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-3">
                    {!isRunning ? (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Play size={16} fill="white" />
                            {phase === "idle" ? "Iniciar" : "Continuar"}
                        </button>
                    ) : (
                        <button
                            onClick={handlePause}
                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-sm"
                        >
                            <Pause size={16} fill="white" />
                            Pausar
                        </button>
                    )}
                    <button
                        onClick={handleReset}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        title="Reiniciar"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Contador total acumulado */}
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Tiempo total estudiado</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                    {formatSeconds(displayTotal)}
                </p>
            </div>
        </div>
    )
}