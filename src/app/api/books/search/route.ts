//==============================================================
// FILE: src/app/api/books/search/route.ts
// DESCRIPTION: Search books (DB first, fallback to Google Books and persist).
//==============================================================

import { prisma } from "../../../lib/prisma"
import { searchGoogleBooks, upsertBooks } from "../../../lib/book"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() || ""
  if (!q) return NextResponse.json({ items: [] })

  // Try DB search first
  const db = await prisma.book.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    take: 20,
    include: { authors: true, categories: true },
  })
  if (db.length > 0) {
    return NextResponse.json({ items: db })
  }

  // Fallback: fetch from Google Books API, persist, and return
  try {
    const goog = await searchGoogleBooks(q)
    if (goog.length > 0) {
      await upsertBooks(goog)
    }
    const refreshed = await prisma.book.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 20,
      include: { authors: true, categories: true },
    })
    return NextResponse.json({ items: refreshed })
  } catch (err) {
    console.error("Google Books fetch failed", err)
    return NextResponse.json({ items: [] })
  }
}
