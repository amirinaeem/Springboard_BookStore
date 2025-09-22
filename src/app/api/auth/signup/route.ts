//==============================================================
// FILE: src/app/api/auth/signup/route.ts
// DESCRIPTION: Create credential-based user with hashed password.
//==============================================================

import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { name, email, passwordHash, role: "USER" } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Signup error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
