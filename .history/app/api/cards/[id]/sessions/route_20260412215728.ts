import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { id } = await params
    const { durationSeconds } = await req.json()

    if (!durationSeconds || durationSeconds <= 0) {
        return NextResponse.json({ error: "Duración inválida" }, { status: 400 })
    }

    const card = await prisma.card.findUnique({ where: { id } })
    if (!card || card.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    const [studySession, updatedCard] = await prisma.$transaction([
        prisma.studySession.create({
            data: {
                cardId: id,
                userId,
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