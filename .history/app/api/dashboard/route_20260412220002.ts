import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"
import { startOfDay, startOfMonth, startOfYear } from "date-fns"

interface SessionWithCard {
    cardId: string
    startedAt: Date
    durationSeconds: number
    card: {
        title: string
        category: { id: string; name: string; color: string } | null
        series: { id: string; name: string } | null
    }
}

export async function GET() {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const now = new Date()
    const todayStart = startOfDay(now)
    const monthStart = startOfMonth(now)
    const yearStart = startOfYear(now)

    const [user, allSessions, allCards] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.studySession.findMany({
            where: { userId },
            include: { card: { include: { category: true, series: true } } },
        }),
        prisma.card.findMany({
            where: { userId },
            include: { category: true, series: true },
        }),
    ])

    const sessions = allSessions as SessionWithCard[]

    const secondsToday = sessions
        .filter((s) => new Date(s.startedAt) >= todayStart)
        .reduce((acc: number, s: SessionWithCard) => acc + s.durationSeconds, 0)

    const secondsMonth = sessions
        .filter((s) => new Date(s.startedAt) >= monthStart)
        .reduce((acc: number, s: SessionWithCard) => acc + s.durationSeconds, 0)

    const secondsYear = sessions
        .filter((s) => new Date(s.startedAt) >= yearStart)
        .reduce((acc: number, s: SessionWithCard) => acc + s.durationSeconds, 0)

    const secondsTotal = sessions
        .reduce((acc: number, s: SessionWithCard) => acc + s.durationSeconds, 0)

    const cardSeconds: Record<string, { title: string; seconds: number }> = {}
    for (const s of sessions) {
        if (!cardSeconds[s.cardId]) {
            cardSeconds[s.cardId] = { title: s.card.title, seconds: 0 }
        }
        cardSeconds[s.cardId].seconds += s.durationSeconds
    }
    const topCards = Object.values(cardSeconds)
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5)

    const catSeconds: Record<string, { name: string; color: string; seconds: number }> = {}
    for (const s of sessions) {
        if (!s.card.category) continue
        const cat = s.card.category
        if (!catSeconds[cat.id]) {
            catSeconds[cat.id] = { name: cat.name, color: cat.color, seconds: 0 }
        }
        catSeconds[cat.id].seconds += s.durationSeconds
    }
    const topCategories = Object.values(catSeconds)
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5)

    const seriesSeconds: Record<string, { name: string; seconds: number }> = {}
    for (const s of sessions) {
        if (!s.card.series) continue
        const ser = s.card.series
        if (!seriesSeconds[ser.id]) {
            seriesSeconds[ser.id] = { name: ser.name, seconds: 0 }
        }
        seriesSeconds[ser.id].seconds += s.durationSeconds
    }
    const topSeries = Object.values(seriesSeconds)
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5)

    const deficit = allCards
        .filter((c) => {
            if (c.status !== "DOING") return false
            const last = c.lastActiveAt ? new Date(c.lastActiveAt) : new Date(c.createdAt)
            const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
            return diffDays >= 5
        })
        .map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category?.name ?? null,
            series: c.series?.name ?? null,
            lastActiveAt: c.lastActiveAt,
            daysInactive: Math.floor(
                (now.getTime() - (c.lastActiveAt ? new Date(c.lastActiveAt) : new Date(c.createdAt)).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
        }))

    const superhabit = Object.entries(cardSeconds)
        .sort((a, b) => b[1].seconds - a[1].seconds)
        .slice(0, 3)
        .map(([id, data]) => ({ id, title: data.title, seconds: data.seconds }))

    const last30: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split("T")[0]
        last30[key] = 0
    }
    for (const s of sessions) {
        const key = new Date(s.startedAt).toISOString().split("T")[0]
        if (key in last30) last30[key] += s.durationSeconds
    }
    const dailyChart = Object.entries(last30).map(([date, secs]) => ({
        date,
        hours: Math.round((secs / 3600) * 100) / 100,
    }))

    return NextResponse.json({
        goals: {
            daily: user?.dailyGoalHours ?? 1,
            monthly: user?.monthlyGoalHours ?? 20,
            annual: user?.annualGoalHours ?? 240,
        },
        studied: {
            todayHours: secondsToday / 3600,
            monthHours: secondsMonth / 3600,
            yearHours: secondsYear / 3600,
            totalHours: secondsTotal / 3600,
            totalSeconds: secondsTotal,
        },
        topCards,
        topCategories,
        topSeries,
        deficit,
        superhabit,
        dailyChart,
        counts: {
            do: allCards.filter((c) => c.status === "DO").length,
            doing: allCards.filter((c) => c.status === "DOING").length,
            done: allCards.filter((c) => c.status === "DONE").length,
        },
    })
}