import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const certificates = await prisma.certificate.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(certificates)
}

export async function POST(req: NextRequest) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Supabase no está configurado" }, { status: 503 })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseKey)

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
    const fileName = `${userId}/${Date.now()}-${file.name.replace(/\s/g, "_")}`

    const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, buffer, { contentType: "application/pdf", upsert: false })

    if (uploadError) {
        console.error("Supabase upload error:", JSON.stringify(uploadError))
        return NextResponse.json({ error: `Error Supabase: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(fileName)

    const certificate = await prisma.certificate.create({
        data: {
            name,
            fileUrl: urlData.publicUrl,
            fileName: file.name,
            fileSize: file.size,
            seriesName: seriesName || null,
            categoryName: categoryName || null,
            issuedAt: issuedAt ? new Date(issuedAt) : null,
            userId,
        },
    })

    return NextResponse.json(certificate, { status: 201 })
}