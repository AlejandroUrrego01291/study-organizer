import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const [allBadges, userBadges, user] = await Promise.all([
        prisma.badge.findMany(),
        prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: { select: { sessions: true } },
                cards: { where: { status: "DONE" } },
            },
        }),
    ])

    const totalSeconds = await prisma.studySession.aggregate({
        where: { userId },
        _sum: { durationSeconds: true },
    })
    const totalHours = (totalSeconds._sum.durationSeconds ?? 0) / 3600
    const completedCards = user?.cards.length ?? 0

    const earnedStars = Math.floor(totalHours)
    const earnedMedals = completedCards
    const earnedTrophies = Math.floor(totalHours / 60)
    const earnedLions = Math.floor(totalHours / 720)

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
                data: { userId, badgeId, count },
            })
        }
    }

    const updatedBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
    })

    return NextResponse.json({
        badges: updatedBadges,
        stats: { totalHours, completedCards, earnedStars, earnedTrophies, earnedLions },
    })
}