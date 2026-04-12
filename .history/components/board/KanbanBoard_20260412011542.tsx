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
        setLoading(false)
    }

    useEffect(() => {
        fetchAll()
    }, [])

    function getCardsByStatus(status: CardStatus) {
        return cards.filter((c) => c.status === status)
    }

    async function handleUpdateCard(id: string, data: Partial<StudyCard>) {
        const res = await fetch(`/api/cards/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            const updated = await res.json()
            setCards((prev) => prev.map((c) => (c.id === id ? updated : c)))
            if (selectedCard?.id === id) setSelectedCard(updated)
        } else {
            toast.error("Error al actualizar la tarjeta")
        }
    }

    async function handleDeleteCard(id: string) {
        const res = await fetch(`/api/cards/${id}`, { method: "DELETE" })
        if (res.ok) {
            setCards((prev) => prev.filter((c) => c.id !== id))
            setSelectedCard(null)
            toast.success("Tarjeta eliminada")
        } else {
            toast.error("Error al eliminar la tarjeta")
        }
    }

    async function handleCreateCard(data: Partial<StudyCard>) {
        const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            const newCard = await res.json()
            setCards((prev) => [newCard, ...prev])
            setShowCreateModal(false)
            toast.success("Tarjeta creada")
        } else {
            toast.error("Error al crear la tarjeta")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <KanbanColumn
                    title="DO"
                    status="DO"
                    cards={getCardsByStatus("DO")}
                    onCardClick={setSelectedCard}
                    onAddCard={() => setShowCreateModal(true)}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                />
                <KanbanColumn
                    title="DOING"
                    status="DOING"
                    cards={getCardsByStatus("DOING")}
                    onCardClick={setSelectedCard}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                />
                <KanbanColumn
                    title="DONE"
                    status="DONE"
                    cards={getCardsByStatus("DONE")}
                    onCardClick={setSelectedCard}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                />
            </div>

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