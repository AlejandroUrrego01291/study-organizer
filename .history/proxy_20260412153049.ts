import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname

    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password")

    const isApiRoute = pathname.startsWith("/api")
    const isStaticRoute =
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/icon") ||
        pathname === "/"

    if (isApiRoute || isStaticRoute) {
        return NextResponse.next()
    }

    // Detectar sesión por cookie
    const sessionToken =
        req.cookies.get("authjs.session-token")?.value ||
        req.cookies.get("__Secure-authjs.session-token")?.value ||
        req.cookies.get("next-auth.session-token")?.value ||
        req.cookies.get("__Secure-next-auth.session-token")?.value

    const isLoggedIn = !!sessionToken

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