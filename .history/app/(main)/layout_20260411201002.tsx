import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { signOut } from "@/auth"
import { LayoutDashboard, Kanban, Award, Settings, LogOut } from "lucide-react"

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect("/login")

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar desktop */}
            <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-indigo-600">📚 Study Organizer</h1>
                    <p className="text-xs text-gray-500 mt-1 truncate">{session.user?.name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/board"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <Kanban size={18} />
                        <span className="font-medium">Tablero</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <LayoutDashboard size={18} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        href="/certifications"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <Award size={18} />
                        <span className="font-medium">Certificaciones</span>
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <Settings size={18} />
                        <span className="font-medium">Configuración</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/login" })
                        }}
                    >
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Bottom nav móvil */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
                <div className="flex justify-around items-center py-2">
                    <Link href="/board" className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-indigo-600">
                        <Kanban size={20} />
                        <span className="text-xs">Tablero</span>
                    </Link>
                    <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-indigo-600">
                        <LayoutDashboard size={20} />
                        <span className="text-xs">Dashboard</span>
                    </Link>
                    <Link href="/certifications" className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-indigo-600">
                        <Award size={20} />
                        <span className="text-xs">Certificados</span>
                    </Link>
                    <Link href="/settings" className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-indigo-600">
                        <Settings size={20} />
                        <span className="text-xs">Config</span>
                    </Link>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 md:ml-64 pb-20 md:pb-0">
                {children}
            </main>
        </div>
    )
}