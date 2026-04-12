import { auth } from "@/auth"
import { redirect } from "next/navigation"
import KanbanBoard from "@/components/board/KanbanBoard"

export default async function BoardPage() {
    const session = await auth()
    if (!session) redirect("/login")

    return (
        <div className="mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
                <Kanban size={22} className="text-indigo-600" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tablero de Estudio</h1>
                <p className="text-sm text-gray-500 mt-0.5">Organiza y monitorea tu progreso</p>
            </div>
        </div>
    )
}