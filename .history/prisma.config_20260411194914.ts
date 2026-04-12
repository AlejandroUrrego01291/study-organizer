import path from "path"
import { defineConfig } from "prisma/config"
import fs from "fs"

function getEnvVar(name: string): string {
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
        if (key !== name) continue
        let value = trimmed.slice(eqIndex + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        return value
      }
    }
  }
  return ""
}

const dbUrl = getEnvVar("DATABASE_URL")

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import("@prisma/adapter-neon")
      const { Pool } = await import("@neondatabase/serverless")
      const pool = new Pool({ connectionString: dbUrl })
      return new PrismaNeon(pool)
    },
  },
})