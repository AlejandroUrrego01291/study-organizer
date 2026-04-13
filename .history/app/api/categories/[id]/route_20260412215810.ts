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
    const { name, color } = await req.json()

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category || category.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    const updated = await prisma.category.update({
        where: { id },
        data: { name: name ?? undefined, color: color ?? undefined },
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
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category || category.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
}