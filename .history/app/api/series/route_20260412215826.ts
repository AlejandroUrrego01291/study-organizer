import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const series = await prisma.series.findMany({
        where: { userId },
        orderBy: { name: "asc" },
    })
    return NextResponse.json(series)
}

export async function POST(req: NextRequest) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

    const series = await prisma.series.create({
        data: { name, userId },
    })
    return NextResponse.json(series, { status: 201 })
}