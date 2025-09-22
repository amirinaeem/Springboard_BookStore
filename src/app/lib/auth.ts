//==============================================================
// FILE: src/lib/auth.ts
// DESCRIPTION: NextAuth v4 options (Credentials + GitHub + Google).
//==============================================================

import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null
        const user = await prisma.user.findUnique({ where: { email: creds.email } })
        if (!user?.passwordHash) return null
        const ok = await bcrypt.compare(creds.password, user.passwordHash)
        return ok ? { id: user.id, email: user.email!, name: user.name || "" } : null
      },
    }),

    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [GitHub({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET })]
      : []),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Persist minimal identity on first login
        (token as any).id = (user as any).id
        ;(token as any).role = (user as any).role || "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // expose id/role to the client
        ;(session.user as any).id = (token as any).id
        ;(session.user as any).role = (token as any).role
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
