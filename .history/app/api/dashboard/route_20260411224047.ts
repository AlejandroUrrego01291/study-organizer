import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, startOfMonth, startOfYear } from "date-fns"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
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

    // Tiempo por periodo
    const secondsToday = allSessions
        .filter((s) => new Date(s.startedAt) >= todayStart)
        .reduce((acc, s) => acc + s.durationSeconds, 0)

    const secondsMonth = allSessions
        .filter((s) => new Date(s.startedAt) >= monthStart)
        .reduce((acc, s) => acc + s.durationSeconds, 0)

    const secondsYear = allSessions
        .filter((s) => new Date(s.startedAt) >= yearStart)
        .reduce((acc, s) => acc + s.durationSeconds, 0)

    const secondsTotal = allSessions.reduce((acc, s) => acc + s.durationSeconds, 0)

    // Top temas
    const cardSeconds: Record<string, { title: string; seconds: number }> = {}
    for (const s of allSessions) {
        if (!cardSeconds[s.cardId]) {
            cardSeconds[s.cardId] = { title: s.card.title, seconds: 0 }
        }
        cardSeconds[s.cardId].seconds += s.durationSeconds
    }
    const topCards = Object.values(cardSeconds)
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5)

    // Top categorías
    const catSeconds: Record<string, { name: string; color: string; seconds: number }> = {}
    for (const s of allSessions) {
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

    // Top series
    const seriesSeconds: Record<string, { name: string; seconds: number }> = {}
    for (const s of allSessions) {
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

    // Déficit: tarjetas DOING sin actividad en más de 5 días
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
            category: c.category?.name || null,
            series: c.series?.name || null,
            lastActiveAt: c.lastActiveAt,
            daysInactive: Math.floor(
                (now.getTime() - (c.lastActiveAt ? new Date(c.lastActiveAt) : new Date(c.createdAt)).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
        }))

    // Superhábito: top 3 tarjetas más estudiadas
    const superhabit = Object.entries(cardSeconds)
        .sort((a, b) => b[1].seconds - a[1].seconds)
        .slice(0, 3)
        .map(([id, data]) => ({ id, ...data }))

    // Sesiones por día (últimos 30 días para gráfico)
    const last30: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split("T")[0]
        last30[key] = 0
    }
    for (const s of allSessions) {
        const key = new Date(s.startedAt).toISOString().split("T")[0]
        if (key in last30) last30[key] += s.durationSeconds
    }
    const dailyChart = Object.entries(last30).map(([date, seconds]) => ({
        date,
        hours: Math.round((seconds / 3600) * 100) / 100,
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
            totalSeconds,
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