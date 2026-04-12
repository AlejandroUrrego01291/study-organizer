import { auth } from "@/auth"
import { redirect } from "next/navigation"
import KanbanBoard from "@/components/board/KanbanBoard"

export default async function BoardPage() {
    const session = await auth()
    if (!session) redirect("/login")

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tablero de Estudio</h1>
                <p className="text-gray-500 mt-1">Organiza y monitorea tu progreso</p>
            </div>
            <KanbanBoard />
        </div>
    )
}