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
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex overflow-hidden">
            {/* Sidebar Desktop - Glassmorphism Premium */}
            <aside className="hidden md:flex w-72 bg-white/10 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex-col fixed h-full z-20">
                {/* Header */}
                <div className="p-8 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-500/30">
                            📚
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tighter text-white">Study Organizer</h1>
                            <p className="text-sm text-zinc-400 mt-0.5 truncate">{session.user?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-6 py-8 space-y-2">
                    <Link
                        href="/board"
                        className="group flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-[0.97]"
                    >
                        <div className="w-9 h-9 flex items-center justify-center">
                            <Kanban size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <span className="font-medium text-base">Tablero</span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-[0.97]"
                    >
                        <div className="w-9 h-9 flex items-center justify-center">
                            <LayoutDashboard size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <span className="font-medium text-base">Dashboard</span>
                    </Link>

                    <Link
                        href="/certifications"
                        className="group flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-[0.97]"
                    >
                        <div className="w-9 h-9 flex items-center justify-center">
                            <Award size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <span className="font-medium text-base">Certificaciones</span>
                    </Link>

                    <Link
                        href="/settings"
                        className="group flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-[0.97]"
                    >
                        <div className="w-9 h-9 flex items-center justify-center">
                            <Settings size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <span className="font-medium text-base">Configuración</span>
                    </Link>
                </nav>

                {/* Cerrar sesión */}
                <div className="p-6 border-t border-white/10 mt-auto">
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/login" })
                        }}
                    >
                        <button
                            type="submit"
                            className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 active:scale-[0.97]"
                        >
                            <div className="w-9 h-9 flex items-center justify-center">
                                <LogOut size={22} className="transition-transform group-hover:scale-110" />
                            </div>
                            <span className="font-medium text-base">Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Bottom Navigation Móvil - Glassmorphism */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-2xl border-t border-white/10 z-30 shadow-2xl">
                <div className="flex justify-around items-center py-3 px-6">
                    <Link
                        href="/board"
                        className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-all active:scale-95 p-2"
                    >
                        <Kanban size={24} />
                        <span className="text-[10px] font-medium tracking-widest">TABLER</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-all active:scale-95 p-2"
                    >
                        <LayoutDashboard size={24} />
                        <span className="text-[10px] font-medium tracking-widest">DASH</span>
                    </Link>
                    <Link
                        href="/certifications"
                        className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-all active:scale-95 p-2"
                    >
                        <Award size={24} />
                        <span className="text-[10px] font-medium tracking-widest">CERT</span>
                    </Link>
                    <Link
                        href="/settings"
                        className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-all active:scale-95 p-2"
                    >
                        <Settings size={24} />
                        <span className="text-[10px] font-medium tracking-widest">CONFIG</span>
                    </Link>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 md:ml-72 pb-20 md:pb-0 bg-zinc-950/50 min-h-screen">
                {children}
            </main>
        </div>
    )
}