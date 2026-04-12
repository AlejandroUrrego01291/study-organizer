"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface Props {
    data: { date: string; hours: number }[]
}

export default function ActivityChart({ data }: Props) {
    const formatted = data.map((d) => ({
        ...d,
        label: format(parseISO(d.date), "dd MMM", { locale: es }),
    }))

    // Solo mostrar cada 5 días en el eje X para no saturar
    const tickFormatter = (_: string, index: number) =>
        index % 5 === 0 ? formatted[index]?.label ?? "" : ""

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                📈 Actividad últimos 30 días
            </h3>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={(val, i) => (i % 5 === 0 ? val : "")}
                        interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip
                        formatter={(val: number | string) => [
                            `${Number(val).toFixed(2)}h`,
                            "Horas",
                        ]}
                        labelStyle={{ fontSize: 12 }}
                        contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorHours)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}