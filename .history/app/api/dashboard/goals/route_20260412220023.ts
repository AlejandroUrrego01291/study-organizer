import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function PATCH(req: NextRequest) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { dailyGoalHours, monthlyGoalHours, annualGoalHours } = await req.json()

    const user = await prisma.user.update({
        where: { id: userId },
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