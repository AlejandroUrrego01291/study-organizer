import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { validateUser } from "@/lib/auth-helpers"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
            if (token) {
                (session.user as any).id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
            }
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
})