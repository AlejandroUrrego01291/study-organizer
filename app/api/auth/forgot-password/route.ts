import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/resend"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })

        // Siempre responde igual para no revelar si el email existe
        if (!user) {
            return NextResponse.json({
                message: "Si ese correo existe, recibirás un enlace en breve.",
            })
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

        await prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry },
        })

        await sendPasswordResetEmail(email, resetToken)

        return NextResponse.json({
            message: "Si ese correo existe, recibirás un enlace en breve.",
        })
    } catch (error) {
        console.error("Error en forgot-password:", error)
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}