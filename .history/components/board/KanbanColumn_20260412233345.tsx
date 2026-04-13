"use client"

import { Plus } from "lucide-react"
import { StudyCard, CardStatus } from "./KanbanBoard"
import CardMini from "./CardMini"

interface Props {
    title: string
    status: CardStatus
    cards: StudyCard[]
    onCardClick: (card: StudyCard) => void
    onAddCard?: () => void
    onUpdateCard: (id: string, data: Partial<StudyCard>) => void
    onDeleteCard: (id: string) => void
}

const columnStyles: Record<CardStatus, { bg: string; border: string; badge: string }> = {
    DO: {
        bg: "bg-slate-50",
        border: "border-slate-200",
        badge: "bg-slate-200 text-slate-700",
    },
    DOING: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        badge: "bg-blue-200 text-blue-700",
    },
    DONE: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        badge: "bg-emerald-200 text-emerald-700",
    },
}

export default function KanbanColumn({
    title,
    status,
    cards,
    onCardClick,
    onAddCard,
    onUpdateCard,
    onDeleteCard,
}: Props) {
    const styles = columnStyles[status]

    return (
        <div className={`rounded-2xl border ${styles.border} ${styles.bg} p-4 flex flex-col gap-3 min-h-[400px] w-full min-w-0 overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-800">{title}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
                        {cards.length}
                    </span>
                </div>
                {status === "DO" && (
                    <button
                        onClick={onAddCard}
                        className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-indigo-600"
                        title="Nueva tarjeta"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 w-full min-w-0 overflow-hidden">
                {cards.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        {status === "DO" && "Crea una tarjeta para comenzar"}
                        {status === "DOING" && "No hay temas en progreso"}
                        {status === "DONE" && "Aún no has completado temas"}
                    </div>
                ) : (
                    cards.map((card) => (
                        <CardMini
                            key={card.id}
                            card={card}
                            onClick={() => onCardClick(card)}
                            onDelete={() => onDeleteCard(card.id)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}