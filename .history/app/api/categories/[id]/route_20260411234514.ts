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
    const { name, color } = await req.json()

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category || category.userId !== session.user.id) {
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
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category || category.userId !== session.user.id) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
}