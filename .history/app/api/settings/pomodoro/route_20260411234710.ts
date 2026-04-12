import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { pomodoroMinutes, shortBreakMinutes, longBreakMinutes, sessionsBeforeLong } = await req.json()

    const user = await prisma.user.update({
        where: { id: session.user.id },
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