import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { dailyGoalHours, monthlyGoalHours, annualGoalHours } = await req.json()

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            dailyGoalHours: dailyGoalHours ?? undefined,
            monthlyGoalHours: monthlyGoalHours ?? undefined,
            annualGoalHours: annualGoalHours ?? undefined,
        },
    })

    return NextResponse.json({
        daily: user.dailyGoalHours,
        monthly: user.monthlyGoalHours,
        annual: user.annualGoalHours,
    })
}