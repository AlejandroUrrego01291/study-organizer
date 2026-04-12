"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirm) {
            setError("Las contraseñas no coinciden")
            return
        }
        setLoading(true)
        setError("")

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
            setLoading(false)
            return
        }

        router.push("/login?reset=true")
    }

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <p className="text-red-500">Token inválido o expirado.</p>
                <Link href="/forgot-password" className="text-indigo-600 hover:underline text-sm">
                    Solicitar nuevo enlace
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mínimo 8 caracteres"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña
                </label>
                <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Repite la contraseña"
                    required
                />
            </div>

            {error && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">📚 Study Organizer</h1>
                    <p className="text-gray-500 mt-2">Crea una nueva contraseña</p>
                </div>
                <Suspense fallback={<p className="text-center text-gray-500">Cargando...</p>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}