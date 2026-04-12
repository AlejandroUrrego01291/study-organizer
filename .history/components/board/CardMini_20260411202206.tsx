"use client"

import { Trash2 } from "lucide-react"
import { StudyCard } from "./KanbanBoard"
import { formatSeconds } from "@/lib/utils"
import { differenceInDays } from "date-fns"

interface Props {
    card: StudyCard
    onClick: () => void
    onDelete: () => void
}

function getInactivityColor(card: StudyCard): string {
    const now = new Date()

    if (card.status === "DO") {
        const days = differenceInDays(now, new Date(card.createdAt))
        if (days >= 15) return "bg-red-500"
        if (days >= 10) return "bg-yellow-400"
        return "bg-slate-300"
    }

    if (card.status === "DOING") {
        const lastActive = card.lastActiveAt ? new Date(card.lastActiveAt) : new Date(card.startedAt!)
        const days = differenceInDays(now, lastActive)
        if (days >= 10) return "bg-red-500"
        if (days >= 5) return "bg-yellow-400"
        return "bg-emerald-400"
    }

    return "bg-emerald-400"
}

function getStars(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    return "⭐".repeat(Math.min(hours, 10))
}

export default function CardMini({ card, onClick, onDelete }: Props) {
    const barColor = getInactivityColor(card)

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
            onClick={onClick}
        >
            {/* Franja de color superior */}
            <div className={`h-1.5 w-full ${barColor}`} />

            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{card.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {card.series && (
                                <span className="text-xs text-gray-500 truncate">📚 {card.series.name}</span>
                            )}
                            {card.category && (
                                <span
                                    className="text-xs px-1.5 py-0.5 rounded-full text-white truncate"
                                    style={{ backgroundColor: card.category.color }}
                                >
                                    {card.category.name}
                                </span>
                            )}
                        </div>
                        {card.status === "DONE" && card.totalStudySeconds > 0 && (
                            <p className="text-xs mt-1">{getStars(card.totalStudySeconds)}</p>
                        )}
                        {card.totalStudySeconds > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                ⏱ {formatSeconds(card.totalStudySeconds)}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}