import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const cert = await prisma.certificate.findUnique({ where: { id } })

    if (!cert || cert.userId !== session.user.id) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    // Eliminar archivo de Supabase si está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
        try {
            const { createClient } = await import("@supabase/supabase-js")
            const supabase = createClient(supabaseUrl, supabaseKey)

            // Extraer el path relativo del archivo
            // La URL tiene formato: https://xxx.supabase.co/storage/v1/object/public/certificates/USER_ID/FILENAME
            const marker = "/certificates/"
            const fullPath = cert.fileUrl
            const idx = fullPath.indexOf(marker)

            if (idx !== -1) {
                const filePath = fullPath.slice(idx + marker.length)
                await supabase.storage.from("certificates").remove([filePath])
            }
        } catch (err) {
            console.error("Error al eliminar archivo de Supabase:", err)
            // Continuamos aunque falle Supabase — al menos eliminamos el registro
        }
    }

    await prisma.certificate.delete({ where: { id } })
    return NextResponse.json({ success: true })
}