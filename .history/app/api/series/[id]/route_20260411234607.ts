import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params
    const { name } = await req.json()

    const series = await prisma.series.findUnique({ where: { id } })
    if (!series || series.userId !== session.user.id) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    const updated = await prisma.series.update({
        where: { id },
        data: { name },
    })

    return NextResponse.json(updated)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params
    const series = await prisma.series.findUnique({ where: { id } })
    if (!series || series.userId !== session.user.id) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    await prisma.series.delete({ where: { id } })
    return NextResponse.json({ success: true })
}