import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest) {
    const userId = await getUserId()
    if (!userId) return unauthorized()

    const { name, currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: userId } })
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

    await prisma.user.update({ where: { id: userId }, data: updateData })
    return NextResponse.json({ success: true })
}