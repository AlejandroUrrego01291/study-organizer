import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Kanban, Award, Settings, LogOut } from "lucide-react"
import { headers } from "next/headers"

const navItems = [
    { href: "/board", label: "Tablero", icon: Kanban },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/certifications", label: "Certificaciones", icon: Award },
    { href: "/settings", label: "Configuración", icon: Settings },
]

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect("/login")

    const headersList = await headers()
    const pathname = headersList.get("x-invoke-path") || ""

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-gray-50 flex w-full overflow-hidden">
            <aside className="hidden md:flex w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-xl flex-col fixed h-full z-20">
                <div className="p-8 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <span className="text-5xl">📚</span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-gray-900 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
                                Study Organizer
                            </h1>
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-[140px]">{session.user?.name}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-medium text-[15px]
                  transition-all duration-200 active:scale-[0.98] border
                  ${isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-500"
                                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 border-transparent hover:border-indigo-100"
                                    }`}
                            >
                                <Icon size={20} className="transition-transform group-hover:scale-110 flex-shrink-0" />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <form action="/api/auth/signout" method="POST">
                        <input type="hidden" name="callbackUrl" value="/login" />
                        <button
                            type="submit"
                            className="group flex items-center gap-3 w-full px-6 py-4 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-[0.98] border border-transparent hover:border-red-100 font-medium text-[15px]"
                        >
                            <LogOut size={20} className="transition-transform group-hover:scale-110" />
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </aside>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl z-30">
                <div className="flex justify-around items-center py-2 px-2">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-indigo-600 transition-all active:scale-95">
                            <Icon size={22} />
                            <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            <main className="flex-1 md:ml-72 pb-20 md:pb-0 w-full overflow-hidden max-w-full">
                {children}
            </main>
        </div>
    )
}