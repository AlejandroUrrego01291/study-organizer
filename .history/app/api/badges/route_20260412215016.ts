import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const [allBadges, userBadges, user] = await Promise.all([
        prisma.badge.findMany(),
        prisma.userBadge.findMany({
            where: { userId: session.user.id },
            include: { badge: true },
        }),
        prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                _count: { select: { sessions: true } },
                cards: { where: { status: "DONE" } },
            },
        }),
    ])

    // Calcular horas totales
    const totalSeconds = await prisma.studySession.aggregate({
        where: { userId: session.user.id },
        _sum: { durationSeconds: true },
    })
    const totalHours = (totalSeconds._sum.durationSeconds ?? 0) / 3600
    const completedCards = user?.cards.length ?? 0

    // Calcular insignias que debería tener
    const earnedStars = Math.floor(totalHours)
    const earnedMedals = completedCards
    const earnedTrophies = Math.floor(totalHours / 60)
    const earnedLions = Math.floor(totalHours / 720)

    // Sincronizar insignias automáticamente
    const badgeMap = Object.fromEntries(allBadges.map((b) => [b.key, b.id]))
    const userBadgeMap = Object.fromEntries(userBadges.map((ub) => [ub.badge.key, ub]))

    const updates = [
        { key: "STAR", count: earnedStars },
        { key: "MEDAL", count: earnedMedals },
        { key: "TROPHY", count: earnedTrophies },
        { key: "EPIC_LION", count: earnedLions },
    ]

    for (const { key, count } of updates) {
        if (count <= 0) continue
        const badgeId = badgeMap[key]
        if (!badgeId) continue

        if (userBadgeMap[key]) {
            if (userBadgeMap[key].count !== count) {
                await prisma.userBadge.update({
                    where: { id: userBadgeMap[key].id },
                    data: { count },
                })
            }
        } else {
            await prisma.userBadge.create({
                data: { userId: session.user.id, badgeId, count },
            })
        }
    }

    // Releer insignias actualizadas
    const updatedBadges = await prisma.userBadge.findMany({
        where: { userId: session.user.id },
        include: { badge: true },
    })

    return NextResponse.json({
        badges: updatedBadges,
        stats: { totalHours, completedCards, earnedStars, earnedTrophies, earnedLions },
    })
}