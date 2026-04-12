import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) return null

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return null

    return {
        id: user.id,
        email: user.email,
        name: user.name,
    }
}