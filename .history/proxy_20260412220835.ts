import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname

    // Rutas que siempre pasan
    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/icon") ||
        pathname.startsWith("/sw.js") ||
        pathname.startsWith("/manifest") ||
        pathname === "/"
    ) {
        return NextResponse.next()
    }

    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password")

    // Detectar sesión por cookie — next-auth v4 usa estos nombres
    const sessionToken =
        req.cookies.get("next-auth.session-token")?.value ||
        req.cookies.get("__Secure-next-auth.session-token")?.value

    const isLoggedIn = !!sessionToken

    if (!isLoggedIn && !isAuthPage) {
        const url = new URL("/login", req.nextUrl.origin)
        return NextResponse.redirect(url)
    }

    if (isLoggedIn && isAuthPage) {
        const url = new URL("/board", req.nextUrl.origin)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon).*)"],
}