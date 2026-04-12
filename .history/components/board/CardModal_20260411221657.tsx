"use client"

import { useState } from "react"
import { X, ExternalLink, Edit2, Check, ChevronRight } from "lucide-react"
import { Category, Series, StudyCard } from "./KanbanBoard"
import PomodoroTimer from "./PomodoroTimer"

interface Props {
    card: StudyCard
    categories: Category[]
    series: Series[]
    onClose: () => void
    onUpdate: (id: string, data: Partial<StudyCard>) => void
    onDelete: (id: string) => void
    onCategoryCreated: (cat: Category) => void
    onSeriesCreated: (s: Series) => void
}

function getStars(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    if (hours === 0) return ""
    return "⭐".repeat(Math.min(hours, 20))
}

export default function CardModal({
    card,
    categories,
    series,
    onClose,
    onUpdate,
    onDelete,
    onCategoryCreated,
    onSeriesCreated,
}: Props) {
    const [editMode, setEditMode] = useState(false)
    const [title, setTitle] = useState(card.title)
    const [studyType, setStudyType] = useState(card.studyType)
    const [categoryId, setCategoryId] = useState(card.categoryId || "")
    const [seriesId, setSeriesId] = useState(card.seriesId || "")
    const [resourceUrl, setResourceUrl] = useState(card.resourceUrl || "")
    const [source, setSource] = useState(card.source || "")
    const [notes, setNotes] = useState(card.notes || "")
    const [currentMinute, setCurrentMinute] = useState(card.currentMinute ?? 0)
    const [currentPage, setCurrentPage] = useState(card.currentPage ?? 0)
    const [pomodoroMinutes, setPomodoroMinutes] = useState(card.pomodoroMinutes ?? 25)
    const [totalSeconds, setTotalSeconds] = useState(card.totalStudySeconds)
    const [newCategory, setNewCategory] = useState("")
    const [newSeries, setNewSeries] = useState("")
    const [saving, setSaving] = useState(false)

    async function handleSave() {
        setSaving(true)
        await onUpdate(card.id, {
            title,
            studyType,
            categoryId: categoryId || null,
            seriesId: seriesId || null,
            resourceUrl: resourceUrl || null,
            source: source || null,
            notes: notes || null,
            currentMinute: studyType !== "TEXT" ? currentMinute : null,
            currentPage: studyType === "TEXT" ? currentPage : null,
            pomodoroMinutes,
        } as any)
        setSaving(false)
        setEditMode(false)
    }

    async function handleCreateCategory() {
        if (!newCategory.trim()) return
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCategory }),
        })
        if (res.ok) {
            const cat = await res.json()
            onCategoryCreated(cat)
            setCategoryId(cat.id)
            setNewCategory("")
        }
    }

    async function handleCreateSeries() {
        if (!newSeries.trim()) return
        const res = await fetch("/api/series", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newSeries }),
        })
        if (res.ok) {
            const s = await res.json()
            onSeriesCreated(s)
            setSeriesId(s.id)
            setNewSeries("")
        }
    }

    async function handleComplete() {
        await onUpdate(card.id, { status: "DONE" } as any)
        onClose()
    }

    const isVideo = studyType === "VIDEO" || studyType === "AUDIO"
    const stars = getStars(totalSeconds)

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {editMode ? (
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-lg font-bold text-gray-900 border-b-2 border-indigo-500 outline-none flex-1 bg-transparent"
                            />
                        ) : (
                            <h2 className="text-lg font-bold text-gray-900 truncate">{card.title}</h2>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className={`p-2 rounded-lg transition-colors ${editMode
                                ? "bg-indigo-100 text-indigo-600"
                                : "hover:bg-gray-100 text-gray-500"
                                }`}
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Estrellas si está completado */}
                    {card.status === "DONE" && stars && (
                        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                            <p className="text-sm text-amber-700 font-medium mb-1">
                                ¡Tema completado! 🎉
                            </p>
                            <p className="text-2xl">{stars}</p>
                            <p className="text-xs text-amber-600 mt-1">
                                {Math.floor(totalSeconds / 3600)} hora
                                {Math.floor(totalSeconds / 3600) !== 1 ? "s" : ""} de estudio
                            </p>
                        </div>
                    )}

                    {/* Cronómetro — solo si no está DONE */}
                    {card.status !== "DONE" && (
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                ⏱ Cronómetro Pomodoro
                            </h3>
                            <PomodoroTimer
                                cardId={card.id}
                                focusMinutes={pomodoroMinutes}
                                shortBreakMinutes={5}
                                longBreakMinutes={20}
                                sessionsBeforeLong={4}
                                totalStudySeconds={totalSeconds}
                                onSessionSaved={(newTotal) => setTotalSeconds(newTotal)}
                                onStatusChange={() =>
                                    onUpdate(card.id, { status: "DOING" } as any)
                                }
                            />

                            {editMode && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Duración del bloque Pomodoro (minutos)
                                    </label>
                                    <div className="flex gap-2">
                                        {[25, 50].map((min) => (
                                            <button
                                                key={min}
                                                type="button"
                                                onClick={() => setPomodoroMinutes(min)}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${pomodoroMinutes === min
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {min} min
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info de la tarjeta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tipo de estudio */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Tipo de estudio
                            </label>
                            {editMode ? (
                                <select
                                    value={studyType}
                                    onChange={(e) => setStudyType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="VIDEO">🎬 Video</option>
                                    <option value="AUDIO">🎧 Audio</option>
                                    <option value="TEXT">📖 Texto</option>
                                </select>
                            ) : (
                                <p className="text-sm text-gray-800 font-medium">
                                    {studyType === "VIDEO"
                                        ? "🎬 Video"
                                        : studyType === "AUDIO"
                                            ? "🎧 Audio"
                                            : "📖 Texto"}
                                </p>
                            )}
                        </div>

                        {/* Progreso */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                {isVideo ? "Minuto actual" : "Página actual"}
                            </label>
                            {editMode ? (
                                <input
                                    type="number"
                                    min={0}
                                    value={isVideo ? currentMinute : currentPage}
                                    onChange={(e) =>
                                        isVideo
                                            ? setCurrentMinute(Number(e.target.value))
                                            : setCurrentPage(Number(e.target.value))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-sm text-gray-800 font-medium">
                                    {isVideo
                                        ? currentMinute > 0
                                            ? `Min ${currentMinute}`
                                            : "No registrado"
                                        : currentPage > 0
                                            ? `Pág. ${currentPage}`
                                            : "No registrado"}
                                </p>
                            )}
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Categoría
                            </label>
                            {editMode ? (
                                <div className="space-y-2">
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <input
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="Nueva categoría"
                                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            className="px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-800 font-medium">
                                    {card.category ? (
                                        <span className="inline-flex items-center gap-1">
                                            <span
                                                className="w-2 h-2 rounded-full inline-block"
                                                style={{ backgroundColor: card.category.color }}
                                            />
                                            {card.category.name}
                                        </span>
                                    ) : (
                                        "Sin categoría"
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Serie */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Serie
                            </label>
                            {editMode ? (
                                <div className="space-y-2">
                                    <select
                                        value={seriesId}
                                        onChange={(e) => setSeriesId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Sin serie</option>
                                        {series.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <input
                                            value={newSeries}
                                            onChange={(e) => setNewSeries(e.target.value)}
                                            placeholder="Nueva serie"
                                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateSeries}
                                            className="px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-800 font-medium">
                                    {card.series?.name || "Sin serie"}
                                </p>
                            )}
                        </div>

                        {/* Recurso */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Enlace del recurso
                            </label>
                            {editMode ? (
                                <input
                                    type="url"
                                    value={resourceUrl}
                                    onChange={(e) => setResourceUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : card.resourceUrl ? (

                                href = { card.resourceUrl }
    target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium"
  >
                            Abrir recurso <ExternalLink size={13} />
                        </a>
                        ) : (
                        <p className="text-sm text-gray-400">No registrado</p>
)}
                    </div>

                    {/* Fuente */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Fuente
                        </label>
                        {editMode ? (
                            <input
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="Udemy, Coursera, libro..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        ) : (
                            <p className="text-sm text-gray-800 font-medium">
                                {source || "No registrada"}
                            </p>
                        )}
                    </div>

                    {/* Notas */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Notas
                        </label>
                        {editMode ? (
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Apuntes, observaciones..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        ) : (
                            <p className="text-sm text-gray-800">{notes || "Sin notas"}</p>
                        )}
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs border border-gray-100">
                    <div>
                        <p className="text-gray-500">Creado</p>
                        <p className="font-medium text-gray-800">
                            {new Date(card.createdAt).toLocaleString("es-CO")}
                        </p>
                    </div>
                    {card.startedAt && (
                        <div>
                            <p className="text-gray-500">Iniciado</p>
                            <p className="font-medium text-gray-800">
                                {new Date(card.startedAt).toLocaleString("es-CO")}
                            </p>
                        </div>
                    )}
                    {card.lastActiveAt && (
                        <div>
                            <p className="text-gray-500">Último avance</p>
                            <p className="font-medium text-gray-800">
                                {new Date(card.lastActiveAt).toLocaleString("es-CO")}
                            </p>
                        </div>
                    )}
                    {card.completedAt && (
                        <div>
                            <p className="text-gray-500">Completado</p>
                            <p className="font-medium text-gray-800">
                                {new Date(card.completedAt).toLocaleString("es-CO")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-3 pt-2">
                    {editMode && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            <Check size={16} />
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    )}

                    {card.status === "DOING" && !editMode && (
                        <button
                            onClick={handleComplete}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                        >
                            <ChevronRight size={16} />
                            Marcar como completado
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onDelete(card.id)
                            onClose()
                        }}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                    >
                        Eliminar tarjeta
                    </button>
                </div>
            </div>
        </div>
    </div >
  )
}