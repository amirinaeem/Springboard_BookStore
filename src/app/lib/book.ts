//==============================================================
// FILE: src/lib/book.ts
// DESCRIPTION: Google Books search + Prisma upsert helpers (singleton prisma).
//==============================================================

import { prisma } from "../lib/prisma"

export interface NormalizedBook {
  title: string
  subtitle?: string
  description?: string
  coverUrl?: string
  authors?: string[]
  categories?: string[]
  isbn10?: string
  isbn13?: string
  googleVolumeId?: string
  priceCents?: number
}

export async function searchGoogleBooks(q: string): Promise<NormalizedBook[]> {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  const url = new URL("https://www.googleapis.com/books/v1/volumes")
  url.searchParams.set("q", q)
  url.searchParams.set("maxResults", "20")
  if (key) url.searchParams.set("key", key)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Google Books API failed")
  const data = await res.json()
  const items = (data.items || []) as any[]

  return items.map((it) => {
    const v = it.volumeInfo || {}
    const ids = (v.industryIdentifiers || []) as any[]
    const isbn10 = ids.find((x) => x.type === "ISBN_10")?.identifier
    const isbn13 = ids.find((x) => x.type === "ISBN_13")?.identifier
    return {
      title: v.title,
      subtitle: v.subtitle,
      description: v.description,
      coverUrl: v.imageLinks?.thumbnail?.replace("http://", "https://"),
      authors: v.authors,
      categories: v.categories,
      isbn10,
      isbn13,
      googleVolumeId: it.id,
      priceCents: 1999,
    }
  })
}

export async function upsertBooks(books: NormalizedBook[]) {
  for (const b of books) {
    await prisma.book.upsert({
      where: { googleVolumeId: b.googleVolumeId ?? "" },
      create: {
        title: b.title,
        subtitle: b.subtitle,
        description: b.description,
        coverUrl: b.coverUrl,
        isbn10: b.isbn10,
        isbn13: b.isbn13,
        googleVolumeId: b.googleVolumeId,
        priceCents: b.priceCents ?? 1999,
        authors: {
          connectOrCreate: (b.authors || []).map((a) => ({ where: { name: a }, create: { name: a } })),
        },
        categories: {
          connectOrCreate: (b.categories || []).map((c) => ({ where: { name: c }, create: { name: c } })),
        },
      },
      update: {
        title: b.title,
        subtitle: b.subtitle,
        description: b.description,
        coverUrl: b.coverUrl,
        priceCents: b.priceCents ?? 1999,
      },
    })
  }
}
