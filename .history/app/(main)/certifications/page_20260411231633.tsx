"use client"

import { useEffect, useState, useRef } from "react"
import { Upload, X, Download, Eye, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface Certificate {
    id: string
    name: string
    fileUrl: string
    fileName: string
    fileSize: number
    seriesName: string | null
    categoryName: string | null
    issuedAt: string | null
    createdAt: string
}

interface Badge {
    id: string
    count: number
    earnedAt: string
    badge: { key: string; name: string; description: string; icon: string }
}

function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function CertificationsPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [badges, setBadges] = useState<Badge[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [showUpload, setShowUpload] = useState(false)
    const [formName, setFormName] = useState("")
    const [formSeries, setFormSeries] = useState("")
    const [formCategory, setFormCategory] = useState("")
    const [formDate, setFormDate] = useState("")
    const [formFile, setFormFile] = useState<File | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    async function fetchAll() {
        const [certsRes, badgesRes] = await Promise.all([
            fetch("/api/certificates"),
            fetch("/api/badges"),
        ])
        const [certsData, badgesData] = await Promise.all([
            certsRes.json(),
            badgesRes.json(),
        ])
        setCertificates(certsData)
        setBadges(badgesData.badges ?? [])
        setStats(badgesData.stats ?? null)
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [])

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault()
        if (!formFile || !formName.trim()) {
            toast.error("Nombre y archivo son requeridos")
            return
        }
        if (formFile.type !== "application/pdf") {
            toast.error("Solo se permiten archivos PDF")
            return
        }
        setUploading(true)
        const fd = new FormData()
        fd.append("file", formFile)
        fd.append("name", formName)
        fd.append("seriesName", formSeries)
        fd.append("categoryName", formCategory)
        fd.append("issuedAt", formDate)
        const res = await fetch("/api/certificates", { method: "POST", body: fd })
        if (res.ok) {
            const cert = await res.json()
            setCertificates((prev) => [cert, ...prev])
            toast.success("Certificado subido correctamente")
            setShowUpload(false)
            setFormName("")
            setFormSeries("")
            setFormCategory("")
            setFormDate("")
            setFormFile(null)
        } else {
            toast.error("Error al subir el certificado")
        }
        setUploading(false)
    }

    async function handleDelete(id: string) {
        const res = await fetch(`/api/certificates/${id}`, { method: "DELETE" })
        if (res.ok) {
            setCertificates((prev) => prev.filter((c) => c.id !== id))
            toast.success("Certificado eliminado")
        } else {
            toast.error("Error al eliminar")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Certificaciones e Insignias</h1>
                <p className="text-gray-500 mt-1">Tus logros y reconocimientos</p>
            </div>

            <div>
                <h2 className="text-base font-bold text-gray-800 mb-4">🏆 Mis Insignias</h2>
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: "⭐", label: "Estrellas", count: stats.earnedStars, desc: "1 por cada hora" },
                            { icon: "🏅", label: "Medallas", count: stats.completedCards, desc: "1 por tema terminado" },
                            { icon: "🏆", label: "Trofeos", count: stats.earnedTrophies, desc: "1 por 60 horas" },
                            { icon: "🦁", label: "Leones Épicos", count: stats.earnedLions, desc: "1 por 720 horas" },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className={`bg-white rounded-2xl p-5 border shadow-sm text-center transition-all ${item.count > 0 ? "border-amber-200 bg-amber-50" : "border-gray-100 opacity-60"
                                    }`}
                            >
                                <div className="text-4xl mb-2">{item.count > 0 ? item.icon : "🔒"}</div>
                                <p className="font-bold text-gray-900 text-lg">{item.count > 0 ? item.count : "—"}</p>
                                <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                                <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                                {item.count > 0 && item.label === "Estrellas" && (
                                    <div className="mt-2 text-sm overflow-hidden max-h-8">
                                        {"⭐".repeat(Math.min(item.count, 10))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {stats && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="text-center px-4">
                                <p className="text-2xl font-bold text-indigo-600">{stats.totalHours.toFixed(1)}h</p>
                                <p className="text-xs text-gray-500">Horas totales</p>
                            </div>
                            <div className="text-center px-4">
                                <p className="text-2xl font-bold text-emerald-600">{stats.completedCards}</p>
                                <p className="text-xs text-gray-500">Temas completados</p>
                            </div>
                            <div className="flex-1 px-4">
                                <p className="text-sm text-gray-600 font-medium">Próximo trofeo en:</p>
                                <p className="text-lg font-bold text-violet-600">
                                    {(60 - (stats.totalHours % 60)).toFixed(1)}h
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-800">📜 Mis Certificados</h2>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Upload size={15} />
                        Subir certificado
                    </button>
                </div>

                {certificates.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <p className="text-4xl mb-3">📜</p>
                        <p className="font-medium">Aún no tienes certificados</p>
                        <p className="text-sm mt-1">Sube tu primer certificado PDF</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                                <div
                                    className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center cursor-pointer relative"
                                    onClick={() => setPreviewUrl(cert.fileUrl)}
                                >
                                    <div className="text-center">
                                        <p className="text-5xl">📄</p>
                                        <p className="text-xs text-gray-500 mt-2">Clic para ver</p>
                                    </div>
                                    <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye size={24} className="text-indigo-600" />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{cert.name}</h3>
                                    <div className="mt-1 space-y-0.5">
                                        {cert.seriesName && <p className="text-xs text-gray-500">📂 {cert.seriesName}</p>}
                                        {cert.categoryName && <p className="text-xs text-gray-500">🏷️ {cert.categoryName}</p>}
                                        {cert.issuedAt && (
                                            <p className="text-xs text-gray-500">
                                                📅 {new Date(cert.issuedAt).toLocaleDateString("es-CO")}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400">{formatSize(cert.fileSize)}</p>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <a href={cert.fileUrl} download={cert.fileName} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                                            <Download size={12} />
                                            Descargar
                                        </a>
                                        <button
                                            onClick={() => handleDelete(cert.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showUpload && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-bold text-gray-900">Subir certificado</h2>
                            <button onClick={() => setShowUpload(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del curso *</label>
                                <input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej: React desde cero"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
                                    <input
                                        value={formSeries}
                                        onChange={(e) => setFormSeries(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <input
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de emisión</label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF *</label>
                                <input ref={fileRef} type="file" accept="application/pdf" onChange={(e) => setFormFile(e.target.files?.[0] ?? null)} className="hidden" />
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                                >
                                    {formFile ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">📄 {formFile.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatSize(formFile.size)}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Clic para seleccionar PDF</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={uploading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {uploading ? "Subiendo..." : "Subir"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewUrl && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
                    <div className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <p className="font-semibold text-gray-800">Vista previa del certificado</p>
                            <div className="flex items-center gap-2">
                                <a href={previewUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
                                    <Download size={14} />
                                    Descargar
                                </a>
                                <button onClick={() => setPreviewUrl(null)} className="p-2 rounded-lg hover:bg-gray-100">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <iframe src={previewUrl} className="flex-1 w-full" title="Certificado PDF" />
                    </div>
                </div>
            )}
        </div>
    )
}