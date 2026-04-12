import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const cards = await prisma.card.findMany({
        where: { userId: session.user.id },
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
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

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
            userId: session.user.id,
        },
        include: {
            category: true,
            series: true,
        },
    })

    return NextResponse.json(card, { status: 201 })
}