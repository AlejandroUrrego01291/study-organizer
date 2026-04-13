import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
    })
    return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { name, color } = await req.json()
    if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

    const category = await prisma.category.create({
        data: { name, color: color || "#6366f1", userId },
    })
    return NextResponse.json(category, { status: 201 })
}