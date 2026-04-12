import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    })

    const isLoggedIn = !!token
    const pathname = req.nextUrl.pathname

    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password")

    if (!isLoggedIn && !isAuthPage) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/board", req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}