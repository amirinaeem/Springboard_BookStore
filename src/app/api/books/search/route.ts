//==============================================================
// FILE: src/app/api/books/search/route.ts
// DESCRIPTION: Search books (DB first, fallback to Google Books and persist).
//==============================================================


import { prisma } from '../../../lib/prisma'
import { searchGoogleBooks, upsertBooks } from '../../../lib/book'
import { NextResponse } from 'next/server'


export async function GET(req: Request) {
const { searchParams } = new URL(req.url)
const q = searchParams.get('q') || ''
if (!q) return NextResponse.json({ items: [] })


// DB search
const db = await prisma.book.findMany({
where: { title: { contains: q, mode: 'insensitive' } },
take: 20,
include: { authors: true, categories: true },
})
if (db.length) return NextResponse.json({ items: db })


// Fallback to Google Books, then persist
const goog = await searchGoogleBooks(q)
await upsertBooks(goog)
const refreshed = await prisma.book.findMany({
where: { title: { contains: q, mode: 'insensitive' } },
take: 20,
include: { authors: true, categories: true },
})
return NextResponse.json({ items: refreshed })
}

