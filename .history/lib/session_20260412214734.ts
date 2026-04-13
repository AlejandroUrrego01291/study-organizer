import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function getUserId(): Promise<string | null> {
    const session = await auth()
    return (session?.user as any)?.id ?? null
}

export function unauthorized() {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}