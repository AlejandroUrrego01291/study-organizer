import NextAuth, { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { validateUser } from "@/lib/auth-helpers"
import { getServerSession } from "next-auth/next"

export const authOptions: NextAuthOptions = {
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
            }
            return token
        },
        async session({ session, token }) {
            session.user = {
                ...session.user,
                id: token.id as string,
                email: token.email as string,
                name: token.name as string,
            } as any
            return session
        },
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                return await validateUser(
                    credentials.email as string,
                    credentials.password as string
                )
            },
        }),
    ],
}

export async function auth() {
    return getServerSession(authOptions)
}

export async function signOut() {
    const { redirect } = await import("next/navigation")
    redirect("/login")
}