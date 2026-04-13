import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const cards = await prisma.card.findMany({
        where: { userId },
        include: {
            category: true,
            series: true,
            studySessions: {
                orderBy: { startedAt: "desc" },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const body = await req.json()
    const { title, studyType, categoryId, seriesId, resourceUrl, source, notes, pomodoroMinutes } = body

    if (!title) {
        return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }

    const card = await prisma.card.create({
        data: {
            title,
            studyType: studyType || "VIDEO",
            categoryId: categoryId || null,
            seriesId: seriesId || null,
            resourceUrl: resourceUrl || null,
            source: source || null,
            notes: notes || null,
            pomodoroMinutes: pomodoroMinutes || null,
            userId,
        },
        include: {
            category: true,
            series: true,
        },
    })

    return NextResponse.json(card, { status: 201 })
}