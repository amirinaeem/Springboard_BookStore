//==============================================================
// FILE: src/types/next-auth.d.ts
// DESCRIPTION: Extend NextAuth types to include id and role.
//==============================================================

import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}

// make this a module
export {}
