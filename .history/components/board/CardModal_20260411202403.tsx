"use client"

import { X } from "lucide-react"
import { Category, Series, StudyCard } from "./KanbanBoard"

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

export default function CardModal({ card, onClose, onUpdate, onDelete }: Props) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-900">{card.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 md:hidden"><X size={18} /></button>
                </div>
                <div className="p-6">
                    <p className="text-gray-500 text-sm">Detalle completo de la tarjeta — próximo paso</p>
                    <div className="mt-4 flex gap-3">
                        {card.status !== "DONE" && (
                            <button
                                onClick={() => {
                                    onUpdate(card.id, { status: card.status === "DO" ? "DOING" : "DONE" })
                                    onClose()
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                            >
                                {card.status === "DO" ? "▶ Iniciar" : "✓ Completar"}
                            </button>
                        )}
                        <button
                            onClick={() => { onDelete(card.id); onClose() }}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}