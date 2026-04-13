import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { durationSeconds } = await req.json()

    if (!durationSeconds || durationSeconds <= 0) {
        return NextResponse.json({ error: "Duración inválida" }, { status: 400 })
    }

    const card = await prisma.card.findUnique({ where: { id } })
    if (!card || card.userId !== session.user.id) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    // Crear la sesión y actualizar el total acumulado
    const [studySession, updatedCard] = await prisma.$transaction([
        prisma.studySession.create({
            data: {
                cardId: id,
                userId: session.user.id,
                durationSeconds,
                endedAt: new Date(),
            },
        }),
        prisma.card.update({
            where: { id },
            data: {
                totalStudySeconds: { increment: durationSeconds },
                lastActiveAt: new Date(),
                status: "DOING",
                startedAt: card.startedAt ?? new Date(),
            },
            include: { category: true, series: true },
        }),
    ])

    return NextResponse.json({ studySession, card: updatedCard })
}