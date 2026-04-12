"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Category, Series, StudyCard } from "./KanbanBoard"

interface Props {
    categories: Category[]
    series: Series[]
    onClose: () => void
    onCreate: (data: Partial<StudyCard>) => void
    onCategoryCreated: (cat: Category) => void
    onSeriesCreated: (s: Series) => void
}

export default function CreateCardModal({ categories, series, onClose, onCreate, onCategoryCreated, onSeriesCreated }: Props) {
    const [title, setTitle] = useState("")
    const [studyType, setStudyType] = useState<"VIDEO" | "AUDIO" | "TEXT">("VIDEO")
    const [categoryId, setCategoryId] = useState("")
    const [seriesId, setSeriesId] = useState("")
    const [resourceUrl, setResourceUrl] = useState("")
    const [source, setSource] = useState("")
    const [newCategory, setNewCategory] = useState("")
    const [newSeries, setNewSeries] = useState("")
    const [loading, setLoading] = useState(false)

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return
        setLoading(true)
        await onCreate({
            title,
            studyType,
            categoryId: categoryId || undefined,
            seriesId: seriesId || undefined,
            resourceUrl: resourceUrl || undefined,
            source: source || undefined,
        })
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Nueva tarjeta de estudio</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tema *</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                            placeholder="Ej: Introducción a React"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de estudio</label>
                        <select
                            value={studyType}
                            onChange={(e) => setStudyType(e.target.value as any)}
                            className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                        >
                            <option value="VIDEO">🎬 Video</option>
                            <option value="AUDIO">🎧 Audio</option>
                            <option value="TEXT">📖 Texto</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <div className="flex gap-2">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                            >
                                <option value="">Sin categoría</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="+ Nueva categoría"
                            />
                            <button type="button" onClick={handleCreateCategory} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
                                Agregar
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
                        <div className="flex gap-2">
                            <select
                                value={seriesId}
                                onChange={(e) => setSeriesId(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Sin serie</option>
                                {series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <input
                                value={newSeries}
                                onChange={(e) => setNewSeries(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="+ Nueva serie"
                            />
                            <button type="button" onClick={handleCreateSeries} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
                                Agregar
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enlace del recurso (opcional)</label>
                        <input
                            value={resourceUrl}
                            onChange={(e) => setResourceUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://youtube.com/..."
                            type="url"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuente (opcional)</label>
                        <input
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ej: Udemy, Coursera, libro..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? "Creando..." : "Crear tarjeta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}