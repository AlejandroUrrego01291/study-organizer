import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { id } = await params
    const body = await req.json()

    const card = await prisma.card.findUnique({ where: { id } })
    if (!card || card.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    if (body.status === "DOING" && !card.startedAt) {
        body.startedAt = new Date()
    }
    if (body.status === "DOING") {
        body.lastActiveAt = new Date()
    }
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
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { id } = await params
    const card = await prisma.card.findUnique({ where: { id } })
    if (!card || card.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    await prisma.card.delete({ where: { id } })
    return NextResponse.json({ success: true })
}