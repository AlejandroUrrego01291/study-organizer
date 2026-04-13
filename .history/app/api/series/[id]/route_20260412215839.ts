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
    const { name } = await req.json()

    const series = await prisma.series.findUnique({ where: { id } })
    if (!series || series.userId !== userId) {
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
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { id } = await params
    const series = await prisma.series.findUnique({ where: { id } })
    if (!series || series.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    await prisma.series.delete({ where: { id } })
    return NextResponse.json({ success: true })
}