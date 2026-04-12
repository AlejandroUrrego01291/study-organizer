"use client"

import { useEffect, useState } from "react"
import { Edit2, Trash2, Check, X, Plus } from "lucide-react"
import toast from "react-hot-toast"

interface Category { id: string; name: string; color: string }
interface Series { id: string; name: string }
interface PomodoroSettings {
    pomodoroMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    sessionsBeforeLong: number
}

const PRESET_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#06b6d4", "#84cc16", "#a855f7",
]

export default function SettingsPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [series, setSeries] = useState<Series[]>([])
    const [pomodoro, setPomodoro] = useState<PomodoroSettings>({
        pomodoroMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 20,
        sessionsBeforeLong: 4,
    })
    const [loading, setLoading] = useState(true)

    // Categorías
    const [newCatName, setNewCatName] = useState("")
    const [newCatColor, setNewCatColor] = useState("#6366f1")
    const [editingCat, setEditingCat] = useState<string | null>(null)
    const [editCatName, setEditCatName] = useState("")
    const [editCatColor, setEditCatColor] = useState("")

    // Series
    const [newSeriesName, setNewSeriesName] = useState("")
    const [editingSeries, setEditingSeries] = useState<string | null>(null)
    const [editSeriesName, setEditSeriesName] = useState("")

    // Perfil
    const [profileName, setProfileName] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [savingProfile, setSavingProfile] = useState(false)

    async function fetchAll() {
        const [catsRes, seriesRes, pomRes] = await Promise.all([
            fetch("/api/categories"),
            fetch("/api/series"),
            fetch("/api/settings/pomodoro").catch(() => null),
        ])
        const [catsData, seriesData] = await Promise.all([
            catsRes.json(),
            seriesRes.json(),
        ])
        setCategories(catsData)
        setSeries(seriesData)
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [])

    // CATEGORÍAS
    async function handleAddCategory() {
        if (!newCatName.trim()) return
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCatName, color: newCatColor }),
        })
        if (res.ok) {
            const cat = await res.json()
            setCategories((prev) => [...prev, cat])
            setNewCatName("")
            setNewCatColor("#6366f1")
            toast.success("Categoría creada")
        } else {
            toast.error("Error al crear categoría")
        }
    }

    async function handleUpdateCategory(id: string) {
        const res = await fetch(`/api/categories/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editCatName, color: editCatColor }),
        })
        if (res.ok) {
            const updated = await res.json()
            setCategories((prev) => prev.map((c) => c.id === id ? updated : c))
            setEditingCat(null)
            toast.success("Categoría actualizada")
        } else {
            toast.error("Error al actualizar")
        }
    }

    async function handleDeleteCategory(id: string) {
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
        if (res.ok) {
            setCategories((prev) => prev.filter((c) => c.id !== id))
            toast.success("Categoría eliminada")
        } else {
            toast.error("Error al eliminar")
        }
    }

    // SERIES
    async function handleAddSeries() {
        if (!newSeriesName.trim()) return
        const res = await fetch("/api/series", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newSeriesName }),
        })
        if (res.ok) {
            const s = await res.json()
            setSeries((prev) => [...prev, s])
            setNewSeriesName("")
            toast.success("Serie creada")
        } else {
            toast.error("Error al crear serie")
        }
    }

    async function handleUpdateSeries(id: string) {
        const res = await fetch(`/api/series/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editSeriesName }),
        })
        if (res.ok) {
            const updated = await res.json()
            setSeries((prev) => prev.map((s) => s.id === id ? updated : s))
            setEditingSeries(null)
            toast.success("Serie actualizada")
        } else {
            toast.error("Error al actualizar")
        }
    }

    async function handleDeleteSeries(id: string) {
        const res = await fetch(`/api/series/${id}`, { method: "DELETE" })
        if (res.ok) {
            setSeries((prev) => prev.filter((s) => s.id !== id))
            toast.success("Serie eliminada")
        } else {
            toast.error("Error al eliminar")
        }
    }

    // POMODORO
    async function handleSavePomodoro() {
        const res = await fetch("/api/settings/pomodoro", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pomodoro),
        })
        if (res.ok) {
            toast.success("Configuración Pomodoro guardada")
        } else {
            toast.error("Error al guardar")
        }
    }

    // PERFIL
    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault()
        setSavingProfile(true)
        const res = await fetch("/api/settings/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: profileName || undefined, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
        })
        const data = await res.json()
        if (res.ok) {
            toast.success("Perfil actualizado")
            setCurrentPassword("")
            setNewPassword("")
        } else {
            toast.error(data.error ?? "Error al actualizar")
        }
        setSavingProfile(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-500 mt-1">Personaliza tu experiencia</p>
            </div>

            {/* CATEGORÍAS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">🏷️ Categorías</h2>

                <div className="space-y-2 mb-4">
                    {categories.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No hay categorías aún</p>
                    )}
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                            {editingCat === cat.id ? (
                                <>
                                    <input
                                        value={editCatName}
                                        onChange={(e) => setEditCatName(e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <div className="flex gap-1">
                                        {PRESET_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setEditCatColor(c)}
                                                className={`w-5 h-5 rounded-full border-2 transition-all ${editCatColor === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <button onClick={() => handleUpdateCategory(cat.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingCat(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
                                    <button
                                        onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name); setEditCatColor(cat.color) }}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <input
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nueva categoría..."
                    />
                    <div className="flex gap-1">
                        {PRESET_COLORS.slice(0, 6).map((c) => (
                            <button
                                key={c}
                                onClick={() => setNewCatColor(c)}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${newCatColor === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleAddCategory}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                        <Plus size={14} />
                        Agregar
                    </button>
                </div>
            </div>

            {/* SERIES */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">📂 Series</h2>

                <div className="space-y-2 mb-4">
                    {series.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No hay series aún</p>
                    )}
                    {series.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                            {editingSeries === s.id ? (
                                <>
                                    <input
                                        value={editSeriesName}
                                        onChange={(e) => setEditSeriesName(e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button onClick={() => handleUpdateSeries(s.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingSeries(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">📂</span>
                                    <span className="flex-1 text-sm font-medium text-gray-800">{s.name}</span>
                                    <button
                                        onClick={() => { setEditingSeries(s.id); setEditSeriesName(s.name) }}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSeries(s.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <input
                        value={newSeriesName}
                        onChange={(e) => setNewSeriesName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSeries()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nueva serie..."
                    />
                    <button
                        onClick={handleAddSeries}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                        <Plus size={14} />
                        Agregar
                    </button>
                </div>
            </div>

            {/* POMODORO */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">🍅 Configuración Pomodoro</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                        { label: "Bloque de enfoque (min)", key: "pomodoroMinutes" },
                        { label: "Descanso corto (min)", key: "shortBreakMinutes" },
                        { label: "Descanso largo (min)", key: "longBreakMinutes" },
                        { label: "Sesiones antes del descanso largo", key: "sessionsBeforeLong" },
                    ].map((item) => (
                        <div key={item.key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{item.label}</label>
                            <input
                                type="number"
                                min={1}
                                value={pomodoro[item.key as keyof PomodoroSettings]}
                                onChange={(e) => setPomodoro((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 mb-4">
                    <p className="font-semibold mb-1">Configuración actual:</p>
                    <p>🍅 {pomodoro.pomodoroMinutes} min enfoque → ☕ {pomodoro.shortBreakMinutes} min descanso corto → 🛋️ {pomodoro.longBreakMinutes} min descanso largo cada {pomodoro.sessionsBeforeLong} pomodoros</p>
                </div>
                <button
                    onClick={handleSavePomodoro}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                    Guardar configuración Pomodoro
                </button>
            </div>

            {/* PERFIL */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">👤 Perfil</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Cambiar contraseña</p>
                        <div className="space-y-3">
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Contraseña actual"
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Nueva contraseña (mín. 8 caracteres)"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {savingProfile ? "Guardando..." : "Guardar perfil"}
                    </button>
                </form>
            </div>
        </div>
    )
}