import { auth } from "@/auth"
import { redirect } from "next/navigation"
import KanbanBoard from "@/components/board/KanbanBoard"

export default async function BoardPage() {
    const session = await auth()
    if (!session) redirect("/login")

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header moderno */}
                <div className="mb-10 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            📋
                        </div>
                        <div>
                            <h1 className="text-4xl font-semibold tracking-tighter text-gray-900">
                                Tablero de Estudio
                            </h1>
                            <p className="text-lg text-gray-500 mt-1">
                                Organiza tus tareas y monitorea tu progreso académico
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenedor del Kanban con estilo premium */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
                    <KanbanBoard />
                </div>
            </div>
        </div>
    )
}