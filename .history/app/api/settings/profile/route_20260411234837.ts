import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { name, currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    const updateData: any = {}

    if (name) updateData.name = name

    if (newPassword) {
        if (!currentPassword) {
            return NextResponse.json({ error: "Debes ingresar tu contraseña actual" }, { status: 400 })
        }
        const valid = await bcrypt.compare(currentPassword, user.password)
        if (!valid) {
            return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 })
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 })
        }
        updateData.password = await bcrypt.hash(newPassword, 12)
    }

    await prisma.user.update({ where: { id: session.user.id }, data: updateData })
    return NextResponse.json({ success: true })
}