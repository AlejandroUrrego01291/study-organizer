"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })

        setSent(true)
        setLoading(false)
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">📚 Study Organizer</h1>
                    <p className="text-gray-500 mt-2">Recupera tu contraseña</p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="text-5xl">📬</div>
                        <p className="text-gray-700">
                            Si ese correo existe en nuestro sistema, recibirás un enlace para
                            restablecer tu contraseña en breve.
                        </p>
                        <Link href="/login" className="text-indigo-600 hover:underline text-sm">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Enviando..." : "Enviar enlace"}
                        </button>

                        <Link
                            href="/login"
                            className="block text-center text-sm text-gray-800 hover:underline"
                        >
                            Volver al inicio de sesión
                        </Link>
                    </form>
                )}
            </div>
        </div>
    )
}