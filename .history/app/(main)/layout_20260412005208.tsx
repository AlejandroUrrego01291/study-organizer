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
        <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-gray-50 flex">
            {/* Sidebar desktop */}
            <aside className="hidden md:flex w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-xl flex-col fixed h-full z-20">
                {/* Header */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
                            📚
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Study Organizer</h1>
                            <p className="text-xs text-gray-500 mt-0.5">{session.user?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Navegación - Con más profundidad y estilo moderno */}
                <nav className="flex-1 p-6 space-y-2">
                    <Link
                        href="/board"
                        className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-indigo-100 hover:text-indigo-700 transition-all duration-300 active:scale-[0.985] border border-transparent hover:border-indigo-100"
                    >
                        <Kanban size={20} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium">Tablero</span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-indigo-100 hover:text-indigo-700 transition-all duration-300 active:scale-[0.985] border border-transparent hover:border-indigo-100"
                    >
                        <LayoutDashboard size={20} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        href="/certifications"
                        className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-indigo-100 hover:text-indigo-700 transition-all duration-300 active:scale-[0.985] border border-transparent hover:border-indigo-100"
                    >
                        <Award size={20} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium">Certificaciones</span>
                    </Link>

                    <Link
                        href="/settings"
                        className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-indigo-100 hover:text-indigo-700 transition-all duration-300 active:scale-[0.985] border border-transparent hover:border-indigo-100"
                    >
                        <Settings size={20} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium">Configuración</span>
                    </Link>
                </nav>

                {/* Cerrar sesión */}
                <div className="p-6 border-t border-gray-100 mt-auto">
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/login" })
                        }}
                    >
                        <button
                            type="submit"
                            className="group flex items-center gap-3 w-full px-6 py-3.5 rounded-2xl text-gray-600 hover:bg-red-50 hover:shadow-lg hover:shadow-red-100 hover:text-red-600 transition-all duration-300 active:scale-[0.985] border border-transparent hover:border-red-100"
                        >
                            <LogOut size={20} className="transition-transform group-hover:scale-110" />
                            <span className="font-medium">Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Bottom nav móvil */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl z-30">
                <div className="flex justify-around items-center py-3 px-4">
                    <Link href="/board" className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:text-indigo-600 transition-all active:scale-95">
                        <Kanban size={22} />
                        <span className="text-[10px] font-medium">Tablero</span>
                    </Link>
                    <Link href="/dashboard" className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:text-indigo-600 transition-all active:scale-95">
                        <LayoutDashboard size={22} />
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </Link>
                    <Link href="/certifications" className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:text-indigo-600 transition-all active:scale-95">
                        <Award size={22} />
                        <span className="text-[10px] font-medium">Certificados</span>
                    </Link>
                    <Link href="/settings" className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:text-indigo-600 transition-all active:scale-95">
                        <Settings size={22} />
                        <span className="text-[10px] font-medium">Config</span>
                    </Link>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 md:ml-72 pb-20 md:pb-0">
                {children}
            </main>
        </div>
    )
}