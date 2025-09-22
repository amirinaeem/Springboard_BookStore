//==============================================================
// FILE: src/app/api/auth/[...nextauth]/route.ts
// DESCRIPTION: NextAuth route handler (v4) for App Router.
//==============================================================

import NextAuth from "next-auth"
import { authOptions } from "../../../lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
