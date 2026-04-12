import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const certificates = await prisma.certificate.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(certificates)
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const seriesName = formData.get("seriesName") as string
    const categoryName = formData.get("categoryName") as string
    const issuedAt = formData.get("issuedAt") as string

    if (!file || !name) {
        return NextResponse.json({ error: "Archivo y nombre son requeridos" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${session.user.id}/${Date.now()}-${file.name.replace(/\s/g, "_")}`

    const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, buffer, {
            contentType: "application/pdf",
            upsert: false,
        })

    if (uploadError) {
        return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(fileName)

    const certificate = await prisma.certificate.create({
        data: {
            name,
            fileUrl: urlData.publicUrl,
            fileName: file.name,
            fileSize: file.size,
            seriesName: seriesName || null,
            categoryName: categoryName || null,
            issuedAt: issuedAt ? new Date(issuedAt) : null,
            userId: session.user.id,
        },
    })

    return NextResponse.json(certificate, { status: 201 })
}