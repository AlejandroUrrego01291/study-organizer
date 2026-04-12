import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const series = await prisma.series.findMany({
        where: { userId: session.user.id },
        orderBy: { name: "asc" },
    })
    return NextResponse.json(series)
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

    const series = await prisma.series.create({
        data: { name, userId: session.user.id },
    })
    return NextResponse.json(series, { status: 201 })
}