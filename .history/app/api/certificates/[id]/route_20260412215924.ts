import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { id } = await params
    const cert = await prisma.certificate.findUnique({ where: { id } })

    if (!cert || cert.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
        try {
            const { createClient } = await import("@supabase/supabase-js")
            const supabase = createClient(supabaseUrl, supabaseKey)
            const marker = "/certificates/"
            const idx = cert.fileUrl.indexOf(marker)
            if (idx !== -1) {
                const filePath = cert.fileUrl.slice(idx + marker.length)
                await supabase.storage.from("certificates").remove([filePath])
            }
        } catch (err) {
            console.error("Error al eliminar archivo de Supabase:", err)
        }
    }

    await prisma.certificate.delete({ where: { id } })
    return NextResponse.json({ success: true })
}