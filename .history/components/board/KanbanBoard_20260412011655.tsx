"use client"

import { useEffect, useState } from "react"
import KanbanColumn from "./KanbanColumn"
import CardModal from "./CardModal"
import CreateCardModal from "./CreateCardModal"
import toast from "react-hot-toast"

export type CardStatus = "DO" | "DOING" | "DONE"
export type StudyType = "VIDEO" | "AUDIO" | "TEXT"

export interface Category {
    id: string
    name: string
    color: string
}

export interface Series {
    id: string
    name: string
}

export interface StudyCard {
    id: string
    title: string
    status: CardStatus
    studyType: StudyType
    currentMinute: number | null
    currentPage: number | null
    resourceUrl: string | null
    source: string | null
    notes: string | null
    createdAt: string
    startedAt: string | null
    lastActiveAt: string | null
    completedAt: string | null
    totalStudySeconds: number
    pomodoroMinutes: number | null
    categoryId: string | null
    seriesId: string | null
    category: Category | null
    series: Series | null
}

export default function KanbanBoard() {
    const [cards, setCards] = useState<StudyCard[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [series, setSeries] = useState<Series[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCard, setSelectedCard] = useState<StudyCard | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    async function fetchAll() {
        setLoading(true)
        try {
            const [cardsRes, catsRes, seriesRes] = await Promise.all([
                fetch("/api/cards"),
                fetch("/api/categories"),
                fetch("/api/series"),
            ])

            const [cardsData, catsData, seriesData] = await Promise.all([
                cardsRes.json(),
                catsRes.json(),
                seriesRes.json(),
            ])

            setCards(cardsData)
            setCategories(catsData)
            setSeries(seriesData)
        } catch (error) {
            toast.error("Error al cargar el tablero")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAll()
    }, [])

    const getCardsByStatus = (status: CardStatus) =>
        cards.filter((card) => card.status === status)

    const handleUpdateCard = async (id: string, data: Partial<StudyCard>) => {
        const res = await fetch(`/api/cards/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            const updated = await res.json()
            setCards((prev) => prev.map((c) => (c.id === id ? updated : c)))
            if (selectedCard?.id === id) setSelectedCard(updated)
            toast.success("Tarjeta actualizada")
        } else {
            toast.error("Error al actualizar la tarjeta")
        }
    }

    const handleDeleteCard = async (id: string) => {
        const res = await fetch(`/api/cards/${id}`, { method: "DELETE" })
        if (res.ok) {
            setCards((prev) => prev.filter((c) => c.id !== id))
            setSelectedCard(null)
            toast.success("Tarjeta eliminada correctamente")
        } else {
            toast.error("Error al eliminar la tarjeta")
        }
    }

    const handleCreateCard = async (data: Partial<StudyCard>) => {
        const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            const newCard = await res.json()
            setCards((prev) => [newCard, ...prev])
            setShowCreateModal(false)
            toast.success("¡Nueva tarjeta creada!")
        } else {
            toast.error("Error al crear la tarjeta")
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-indigo-600" />
                <p className="text-gray-500 font-medium">Cargando tu tablero...</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                {/* Encabezado del tablero */}
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Tu Tablero</h2>
                        <p className="text-gray-500 mt-1">Arrastra las tarjetas para cambiar su estado</p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-medium transition-all active:scale-95 shadow-lg shadow-indigo-200"
                    >
                        <span className="text-xl leading-none">+</span>
                        Nueva Tarjeta
                    </button>
                </div>

                {/* Columnas del Kanban */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <KanbanColumn
                        title="Por hacer"
                        status="DO"
                        cards={getCardsByStatus("DO")}
                        onCardClick={setSelectedCard}
                        onAddCard={() => setShowCreateModal(true)}
                        onUpdateCard={handleUpdateCard}
                        onDeleteCard={handleDeleteCard}
                    />
                    <KanbanColumn
                        title="En progreso"
                        status="DOING"
                        cards={getCardsByStatus("DOING")}
                        onCardClick={setSelectedCard}
                        onUpdateCard={handleUpdateCard}
                        onDeleteCard={handleDeleteCard}
                    />
                    <KanbanColumn
                        title="Completado"
                        status="DONE"
                        cards={getCardsByStatus("DONE")}
                        onCardClick={setSelectedCard}
                        onUpdateCard={handleUpdateCard}
                        onDeleteCard={handleDeleteCard}
                    />
                </div>
            </div>

            {/* Modales */}
            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    categories={categories}
                    series={series}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={handleUpdateCard}
                    onDelete={handleDeleteCard}
                    onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
                    onSeriesCreated={(s) => setSeries((prev) => [...prev, s])}
                />
            )}

            {showCreateModal && (
                <CreateCardModal
                    categories={categories}
                    series={series}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateCard}
                    onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
                    onSeriesCreated={(s) => setSeries((prev) => [...prev, s])}
                />
            )}
        </>
    )
}