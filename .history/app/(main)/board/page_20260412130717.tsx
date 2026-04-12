import { auth } from "@/auth"
import { redirect } from "next/navigation"
import KanbanBoard from "@/components/board/KanbanBoard"
import { Kanban } from "lucide-react"

export default async function BoardPage() {
    const session = await auth()
    if (!session) redirect("/login")

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-2xl shadow-sm">
                    <Kanban size={24} className="text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tablero de Estudio</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Organiza y monitorea tu progreso</p>
                </div>
            </div>
            <KanbanBoard />
        </div>
    )
}