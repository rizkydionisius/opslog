import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [], // Add providers here (e.g. GitHub, Google). Empty for now as user just asked for "standard setup".
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
            }
            return session
        },
    },
})
