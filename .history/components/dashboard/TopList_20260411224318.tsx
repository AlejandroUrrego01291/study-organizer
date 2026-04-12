interface Item {
    name: string
    seconds: number
    color?: string
}

interface Props {
    title: string
    icon: string
    items: Item[]
}

function formatHours(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

export default function TopList({ title, icon, items }: Props) {
    if (items.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{icon} {title}</h3>
                <p className="text-sm text-gray-400 text-center py-4">Sin datos aún</p>
            </div>
        )
    }

    const max = items[0].seconds

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{icon} {title}</h3>
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                                {item.color && (
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                )}
                                <span className="text-sm text-gray-800 font-medium truncate">{item.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatHours(item.seconds)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className="h-1.5 rounded-full bg-indigo-400 transition-all duration-500"
                                style={{ width: `${(item.seconds / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}