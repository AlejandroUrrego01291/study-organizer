import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const card = await prisma.card.findUnique({ where: { id } })
    if (!card || card.userId !== session.user.id) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    // Si cambia a DOING por primera vez
    if (body.status === "DOING" && !card.startedAt) {
        body.startedAt = new Date()
    }

    // Si cambia a DOING (cualquier vez), actualiza lastActiveAt
    if (body.status === "DOING") {
        body.lastActiveAt = new Date()
    }

    // Si cambia a DONE
    if (body.status === "DONE") {
        body.completedAt = new Date()
    }

    const updated = await prisma.card.update({
        where: { id },
        data: body,
        include: { category: true, series: true },
    })

    return NextResponse.json(updated)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const card = await prisma.card.findUnique({ where: { id } })
    if (!card || card.userId !== session.user.id) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    await prisma.card.delete({ where: { id } })
    return NextResponse.json({ success: true })
}