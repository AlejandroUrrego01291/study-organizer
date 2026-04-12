"use client"

import { useState } from "react"
import { Edit2, Check, X } from "lucide-react"

interface Props {
    label: string
    icon: string
    goalHours: number
    studiedHours: number
    color: string
    onSave: (newGoal: number) => void
}

export default function GoalThermometer({
    label,
    icon,
    goalHours,
    studiedHours,
    color,
    onSave,
}: Props) {
    const [editing, setEditing] = useState(false)
    const [inputVal, setInputVal] = useState(String(goalHours))

    const pct = Math.min((studiedHours / goalHours) * 100, 100)
    const rounded = Math.round(pct)

    const colorMap: Record<string, { bar: string; text: string; bg: string }> = {
        indigo: { bar: "bg-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50" },
        emerald: { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
        violet: { bar: "bg-violet-500", text: "text-violet-600", bg: "bg-violet-50" },
    }
    const c = colorMap[color] ?? colorMap.indigo

    function handleSave() {
        const val = parseFloat(inputVal)
        if (!isNaN(val) && val > 0) onSave(val)
        setEditing(false)
    }

    return (
        <div className={`rounded-2xl p-5 border border-gray-100 bg-white shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
                {!editing ? (
                    <button
                        onClick={() => { setInputVal(String(goalHours)); setEditing(true) }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                        <Edit2 size={14} />
                    </button>
                ) : (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            min={0.1}
                            step={0.5}
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <span className="text-xs text-gray-500">h</span>
                        <button onClick={handleSave} className="p-1 rounded text-emerald-600 hover:bg-emerald-50">
                            <Check size={14} />
                        </button>
                        <button onClick={() => setEditing(false)} className="p-1 rounded text-red-400 hover:bg-red-50">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full transition-all duration-700 ${c.bar}`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-2xl font-bold text-gray-900">
                        {studiedHours.toFixed(1)}
                        <span className="text-sm font-normal text-gray-500"> / {goalHours}h</span>
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${c.bg} ${c.text}`}>
                    {rounded}%
                </div>
            </div>
        </div>
    )
}