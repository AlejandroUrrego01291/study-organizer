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

const tabs: { status: CardStatus; label: string; emoji: string }[] = [
    { status: "DO", label: "Por hacer", emoji: "📋" },
    { status: "DOING", label: "En progreso", emoji: "▶️" },
    { status: "DONE", label: "Completado", emoji: "✅" },
]

export default function KanbanBoard() {
    const [cards, setCards] = useState<StudyCard[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [series, setSeries] = useState<Series[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCard, setSelectedCard] = useState<StudyCard | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [activeTab, setActiveTab] = useState<CardStatus>("DOING")

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

    useEffect(() => { fetchAll() }, [])

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
            {/* Vista móvil — tabs */}
            <div className="md:hidden">
                <div className="flex rounded-2xl bg-gray-100 p-1 mb-4">
                    {tabs.map((tab) => {
                        const count = getCardsByStatus(tab.status).length
                        return (
                            <button
                                key={tab.status}
                                onClick={() => setActiveTab(tab.status)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.status
                                        ? "bg-white text-indigo-700 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <span>{tab.emoji}</span>
                                <span className="hidden xs:inline">{tab.label}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.status ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600"
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <KanbanColumn
                    title={tabs.find((t) => t.status === activeTab)!.label}
                    status={activeTab}
                    cards={getCardsByStatus(activeTab)}
                    onCardClick={setSelectedCard}
                    onAddCard={activeTab === "DO" ? () => setShowCreateModal(true) : undefined}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                />
            </div>

            {/* Vista desktop — 3 columnas */}
            <div className="hidden md:grid grid-cols-3 gap-6">
                {tabs.map((tab) => (
                    <KanbanColumn
                        key={tab.status}
                        title={tab.label}
                        status={tab.status}
                        cards={getCardsByStatus(tab.status)}
                        onCardClick={setSelectedCard}
                        onAddCard={tab.status === "DO" ? () => setShowCreateModal(true) : undefined}
                        onUpdateCard={handleUpdateCard}
                        onDeleteCard={handleDeleteCard}
                    />
                ))}
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