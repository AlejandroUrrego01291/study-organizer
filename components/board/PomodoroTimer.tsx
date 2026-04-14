"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw, Bell, BellOff } from "lucide-react"
import { formatSeconds } from "@/lib/utils"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { useWarnOnLeave } from "@/lib/hooks/useWarnOnLeave"
import toast from "react-hot-toast"

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

const phaseConfig: Record<PomodoroPhase, {
    label: string
    color: string
    bg: string
    stroke: string
}> = {
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
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const phaseRef = useRef(phase)
    const currentSessionRef = useRef(currentSessionSeconds)
    const completedRef = useRef(completedSessions)

    const { requestPermission, sendNotification } = useNotifications()

    // Sincronizar refs
    useEffect(() => { phaseRef.current = phase }, [phase])
    useEffect(() => { currentSessionRef.current = currentSessionSeconds }, [currentSessionSeconds])
    useEffect(() => { completedRef.current = completedSessions }, [completedSessions])

    // Verificar permisos al montar
    useEffect(() => {
        if ("Notification" in window) {
            setNotificationsEnabled(Notification.permission === "granted")
        }
    }, [])

    // Wake Lock — mantener pantalla activa
    useEffect(() => {
        let wakeLock: any = null
        async function requestWakeLock() {
            try {
                if ("wakeLock" in navigator && isRunning) {
                    wakeLock = await (navigator as any).wakeLock.request("screen")
                }
            } catch { }
        }
        async function releaseWakeLock() {
            if (wakeLock) { await wakeLock.release(); wakeLock = null }
        }
        if (isRunning) requestWakeLock()
        else releaseWakeLock()
        return () => { releaseWakeLock() }
    }, [isRunning])

    // Resetear segundosLeft si cambia focusMinutes e idle
    useEffect(() => {
        if (phase === "idle") setSecondsLeft(focusMinutes * 60)
    }, [focusMinutes, phase])

    // Contador total en tiempo real
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRunning) {
            interval = setInterval(() => setDisplayTotal((prev) => prev + 1), 1000)
        } else {
            setDisplayTotal(savedTotal)
        }
        return () => clearInterval(interval)
    }, [isRunning, savedTotal])

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

    const handleTimerEnd = useCallback((
        currentPhase: PomodoroPhase,
        sessionSeconds: number,
        completed: number
    ) => {
        if (currentPhase === "focus" || currentPhase === "idle") {
            saveSession(sessionSeconds)
            const newCompleted = completed + 1
            setCompletedSessions(newCompleted)
            setCurrentSessionSeconds(0)

            const isLongBreak = newCompleted % sessionsBeforeLong === 0

            if (isLongBreak) {
                setPhase("long_break")
                setSecondsLeft(longBreakMinutes * 60)
                toast("🛋️ ¡Completaste 4 pomodoros! Mereces un descanso largo.", { duration: 8000 })
                sendNotification(
                    "🛋️ ¡Descanso largo!",
                    `Completaste ${newCompleted} pomodoros. Tómate ${longBreakMinutes} minutos.`,
                    { vibrate: true }
                )
            } else {
                setPhase("short_break")
                setSecondsLeft(shortBreakMinutes * 60)
                toast("☕ ¡Buen trabajo! Toma un descanso de 5 minutos.", { icon: "🍅", duration: 6000 })
                sendNotification(
                    "☕ ¡Pomodoro completado!",
                    `Buen trabajo. Tómate ${shortBreakMinutes} minutos de descanso.`,
                    { vibrate: true }
                )
            }
        } else {
            setPhase("focus")
            setSecondsLeft(focusMinutes * 60)
            setIsRunning(false)
            toast("🎯 ¡Descanso terminado! A enfocarse de nuevo.", { duration: 4000 })
            sendNotification(
                "🎯 ¡Hora de enfocarse!",
                "El descanso terminó. ¡A estudiar!",
                { vibrate: true }
            )
        }
    }, [sessionsBeforeLong, longBreakMinutes, shortBreakMinutes, focusMinutes, sendNotification])

    useEffect(() => {
        if (!isRunning) return

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    handleTimerEnd(phaseRef.current, currentSessionRef.current + 1, completedRef.current)
                    return 0
                }
                return prev - 1
            })
            setCurrentSessionSeconds((prev) => prev + 1)
        }, 1000)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning, handleTimerEnd])

    // Advertencia al salir + compensar tiempo
    useWarnOnLeave(isRunning, (secondsAway) => {
        toast(`📱 Estuviste fuera ${secondsAway}s. El tiempo se ajustó.`, {
            duration: 5000,
            icon: "⚠️",
        })
        setCurrentSessionSeconds((prev) => prev + secondsAway)
        setSecondsLeft((prev) => Math.max(0, prev - secondsAway))
    })

    function handleStart() {
        if (phase === "idle") setPhase("focus")
        setIsRunning(true)
        onStatusChange("DOING")
    }

    function handlePause() {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsRunning(false)
        if (currentSessionSeconds > 0) saveSession(currentSessionSeconds)
    }

    function handleReset() {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsRunning(false)
        setPhase("idle")
        setSecondsLeft(focusMinutes * 60)
        setCurrentSessionSeconds(0)
    }

    async function handleToggleNotifications() {
        if (notificationsEnabled) {
            setNotificationsEnabled(false)
            toast("🔕 Notificaciones desactivadas", { duration: 2000 })
            return
        }
        const granted = await requestPermission()
        if (granted) {
            setNotificationsEnabled(true)
            toast("🔔 Notificaciones activadas", { duration: 2000 })
            sendNotification("🔔 Notificaciones activadas", "Te avisaremos cuando termine cada pomodoro.")
        } else {
            toast.error("Permisos de notificación denegados. Actívalos en la configuración del navegador.")
        }
    }

    const config = phaseConfig[phase]
    const totalPhaseSeconds =
        phase === "focus" || phase === "idle" ? focusMinutes * 60
            : phase === "short_break" ? shortBreakMinutes * 60
                : longBreakMinutes * 60

    const progress = ((totalPhaseSeconds - secondsLeft) / totalPhaseSeconds) * 100
    const circumference = 2 * Math.PI * 54
    const strokeDashoffset = circumference - (progress / 100) * circumference
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60

    return (
        <div className="space-y-4">
            {/* Fase actual + toggle notificaciones */}
            <div className={`rounded-xl p-3 ${config.bg} flex items-center justify-between`}>
                <div>
                    <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
                    {completedSessions > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            🍅 {completedSessions} pomodoro{completedSessions !== 1 ? "s" : ""} completado{completedSessions !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleToggleNotifications}
                    className={`p-2 rounded-lg transition-colors ${notificationsEnabled
                        ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                    title={notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
                >
                    {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
            </div>

            {/* Cronómetro circular */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
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
                        <span className="text-4xl font-bold text-gray-900 tabular-nums">
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            {phase === "idle" ? `${focusMinutes} min`
                                : phase === "focus" ? "enfoque"
                                    : "descanso"}
                        </span>
                    </div>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-3">
                    {!isRunning ? (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-base"
                        >
                            <Play size={18} fill="white" />
                            {currentSessionSeconds > 0 || phase !== "idle" ? "Continuar" : "Iniciar"}
                        </button>
                    ) : (
                        <button
                            onClick={handlePause}
                            className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-sm text-base"
                        >
                            <Pause size={18} fill="white" />
                            Pausar
                        </button>
                    )}
                    <button
                        onClick={handleReset}
                        className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        title="Reiniciar"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Contador total */}
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Tiempo total estudiado</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                    {formatSeconds(displayTotal)}
                </p>
            </div>
        </div>
    )
}