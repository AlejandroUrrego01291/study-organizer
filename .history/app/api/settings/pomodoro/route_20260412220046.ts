import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const user = await prisma.user.findUnique({ where: { id: userId } })

    return NextResponse.json({
        pomodoroMinutes: user?.pomodoroMinutes ?? 25,
        shortBreakMinutes: user?.shortBreakMinutes ?? 5,
        longBreakMinutes: user?.longBreakMinutes ?? 20,
        sessionsBeforeLong: user?.sessionsBeforeLong ?? 4,
    })
}

export async function PATCH(req: NextRequest) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { pomodoroMinutes, shortBreakMinutes, longBreakMinutes, sessionsBeforeLong } = await req.json()

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            pomodoroMinutes: pomodoroMinutes ?? undefined,
            shortBreakMinutes: shortBreakMinutes ?? undefined,
            longBreakMinutes: longBreakMinutes ?? undefined,
            sessionsBeforeLong: sessionsBeforeLong ?? undefined,
        },
    })

    return NextResponse.json({
        pomodoroMinutes: user.pomodoroMinutes,
        shortBreakMinutes: user.shortBreakMinutes,
        longBreakMinutes: user.longBreakMinutes,
        sessionsBeforeLong: user.sessionsBeforeLong,
    })
}