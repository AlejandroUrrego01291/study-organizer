import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

// Leer .env.local manualmente como fallback
function loadEnvFallback() {
    const envFiles = [".env.local", ".env"]
    for (const file of envFiles) {
        const filePath = path.resolve(process.cwd(), file)
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8")
            for (const line of content.split("\n")) {
                const trimmed = line.trim()
                if (!trimmed || trimmed.startsWith("#")) continue
                const eqIndex = trimmed.indexOf("=")
                if (eqIndex === -1) continue
                const key = trimmed.slice(0, eqIndex).trim()
                let value = trimmed.slice(eqIndex + 1).trim()
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1)
                }
                if (!process.env[key]) {
                    process.env[key] = value
                }
            }
        }
    }
}

loadEnvFallback()

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error("DATABASE_URL no encontrada")
    }
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma