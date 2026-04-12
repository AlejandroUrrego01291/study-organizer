"use client"

import { useEffect, useState } from "react"
import GoalThermometer from "@/components/dashboard/GoalThermometer"
import TopList from "@/components/dashboard/TopList"
import ActivityChart from "@/components/dashboard/ActivityChart"
import toast from "react-hot-toast"
import { formatSeconds } from "@/lib/utils"
import { LayoutDashboard } from "lucide-react"

interface DashboardData {
    goals: { daily: number; monthly: number; annual: number }
    studied: {
        todayHours: number
        monthHours: number
        yearHours: number
        totalHours: number
        totalSeconds: number
    }
    topCards: { title: string; seconds: number }[]
    topCategories: { name: string; color: string; seconds: number }[]
    topSeries: { name: string; seconds: number }[]
    deficit: { id: string; title: string; category: string | null; series: string | null; daysInactive: number }[]
    superhabit: { id: string; title: string; seconds: number }[]
    dailyChart: { date: string; hours: number }[]
    counts: { do: number; doing: number; done: number }
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchDashboard() {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
            const json = await res.json()
            setData(json)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    async function handleGoalSave(field: "daily" | "monthly" | "annual", value: number) {
        const body: Record<string, number> = {}
        if (field === "daily") body.dailyGoalHours = value
        if (field === "monthly") body.monthlyGoalHours = value
        if (field === "annual") body.annualGoalHours = value

        const res = await fetch("/api/dashboard/goals", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        if (res.ok) {
            const updated = await res.json()
            setData((prev) =>
                prev ? { ...prev, goals: { daily: updated.daily, monthly: updated.monthly, annual: updated.annual } } : prev
            )
            toast.success("Meta actualizada")
        } else {
            toast.error("Error al guardar la meta")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        )
    }

    if (!data) return null

    const totalCards = data.counts.do + data.counts.doing + data.counts.done

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <LayoutDashboard size={32} className="text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-base text-gray-500 mt-0.5">Tu progreso de estudio</p>
                </div>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-indigo-600">{formatSeconds(data.studied.totalSeconds)}</p>
                    <p className="text-xs text-gray-500 mt-1">Tiempo total</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-emerald-600">{data.counts.done}</p>
                    <p className="text-xs text-gray-500 mt-1">Temas completados</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-blue-600">{data.counts.doing}</p>
                    <p className="text-xs text-gray-500 mt-1">En progreso</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-gray-600">{totalCards}</p>
                    <p className="text-xs text-gray-500 mt-1">Total tarjetas</p>
                </div>
            </div>

            {/* Compromisos */}
            <div>
                <h2 className="text-base font-bold text-gray-800 mb-3">🎯 Compromisos de estudio</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GoalThermometer
                        label="Compromiso diario"
                        icon="📅"
                        goalHours={data.goals.daily}
                        studiedHours={data.studied.todayHours}
                        color="indigo"
                        onSave={(val) => handleGoalSave("daily", val)}
                    />
                    <GoalThermometer
                        label="Compromiso mensual"
                        icon="📆"
                        goalHours={data.goals.monthly}
                        studiedHours={data.studied.monthHours}
                        color="emerald"
                        onSave={(val) => handleGoalSave("monthly", val)}
                    />
                    <GoalThermometer
                        label="Compromiso anual"
                        icon="🗓️"
                        goalHours={data.goals.annual}
                        studiedHours={data.studied.yearHours}
                        color="violet"
                        onSave={(val) => handleGoalSave("annual", val)}
                    />
                </div>
            </div>

            {/* Gráfico */}
            <ActivityChart data={data.dailyChart} />

            {/* Tops */}
            <div>
                <h2 className="text-base font-bold text-gray-800 mb-3">🏆 Rankings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TopList
                        title="Temas más estudiados"
                        icon="📚"
                        items={data.topCards.map((c) => ({ name: c.title, seconds: c.seconds }))}
                    />
                    <TopList
                        title="Categorías más estudiadas"
                        icon="🏷️"
                        items={data.topCategories.map((c) => ({ name: c.name, seconds: c.seconds, color: c.color }))}
                    />
                    <TopList
                        title="Series más estudiadas"
                        icon="📂"
                        items={data.topSeries.map((s) => ({ name: s.name, seconds: s.seconds }))}
                    />
                </div>
            </div>

            {/* Déficit */}
            {data.deficit.length > 0 && (
                <div>
                    <h2 className="text-base font-bold text-gray-800 mb-3">🔴 Déficit — Temas abandonados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.deficit.map((item) => (
                            <div key={item.id} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        {item.category && <span className="text-xs text-gray-500">🏷️ {item.category}</span>}
                                        {item.series && <span className="text-xs text-gray-500">📂 {item.series}</span>}
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                                    {item.daysInactive}d sin estudiar
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Superhábito */}
            {data.superhabit.length > 0 && (
                <div>
                    <h2 className="text-base font-bold text-gray-800 mb-3">⚡ Superhábito — Lo que más estudias</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {data.superhabit.map((item, i) => (
                            <div key={item.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                                <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                    <p className="text-xs text-gray-500">{formatSeconds(item.seconds)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}