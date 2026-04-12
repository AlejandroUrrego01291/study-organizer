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
                {/* Header - Logo y título mejorados */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">📚</span>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-gray-900 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
                                Study Organizer
                            </h1>
                            <p className="text-xs text-gray-500 mt-1">{session.user?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Navegación - Botones más grandes con hover notorio */}
                <nav className="flex-1 p-6 space-y-2">
                    <Link
                        href="/board"
                        className="group flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-700 
                                   hover:bg-indigo-500 hover:text-white 
                                   hover:shadow-2xl hover:shadow-indigo-200/70 
                                   transition-all duration-300 active:scale-[0.98] 
                                   border border-transparent hover:border-indigo-400"
                    >
                        <Kanban size={22} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium text-[15px]">Tablero</span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-700 
                                   hover:bg-indigo-500 hover:text-white 
                                   hover:shadow-2xl hover:shadow-indigo-200/70 
                                   transition-all duration-300 active:scale-[0.98] 
                                   border border-transparent hover:border-indigo-400"
                    >
                        <LayoutDashboard size={22} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium text-[15px]">Dashboard</span>
                    </Link>

                    <Link
                        href="/certifications"
                        className="group flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-700 
                                   hover:bg-indigo-500 hover:text-white 
                                   hover:shadow-2xl hover:shadow-indigo-200/70 
                                   transition-all duration-300 active:scale-[0.98] 
                                   border border-transparent hover:border-indigo-400"
                    >
                        <Award size={22} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium text-[15px]">Certificaciones</span>
                    </Link>

                    <Link
                        href="/settings"
                        className="group flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-700 
                                   hover:bg-indigo-500 hover:text-white 
                                   hover:shadow-2xl hover:shadow-indigo-200/70 
                                   transition-all duration-300 active:scale-[0.98] 
                                   border border-transparent hover:border-indigo-400"
                    >
                        <Settings size={22} className="transition-transform group-hover:scale-110" />
                        <span className="font-medium text-[15px]">Configuración</span>
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
                            className="group flex items-center gap-3 w-full px-6 py-4 rounded-2xl text-gray-600 
                                       hover:bg-red-500 hover:text-white 
                                       hover:shadow-2xl hover:shadow-red-200/70 
                                       transition-all duration-300 active:scale-[0.98] 
                                       border border-transparent hover:border-red-400"
                        >
                            <LogOut size={22} className="transition-transform group-hover:scale-110" />
                            <span className="font-medium text-[15px]">Cerrar sesión</span>
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