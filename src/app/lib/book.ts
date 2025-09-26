// FILE: src/lib/book.ts
// DESCRIPTION: Google Books search + on-demand save helper.
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

// FILE: src/lib/book.ts
export async function searchGoogleBooks(q: string): Promise<NormalizedBook[]> {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  const url = new URL("https://www.googleapis.com/books/v1/volumes")
  
  // Limit results from Google API
  url.searchParams.set("q", q.substring(0, 100)) // Limit query length
  url.searchParams.set("maxResults", "20") // Limit results
  url.searchParams.set("printType", "books") // Only books, no magazines
  if (key) url.searchParams.set("key", key)

  // Add timeout to Google API call
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

  try {
    const res = await fetch(url.toString(), { 
      signal: controller.signal 
    })
    
    if (!res.ok) throw new Error(`Google Books API failed: ${res.status}`)
    
    const data = await res.json()
    const items = (data.items || []) as any[]

    // Additional validation and limiting
    return items.slice(0, 20).map((it) => {
      const v = it.volumeInfo || {}
      const ids = (v.industryIdentifiers || []) as any[]
      const isbn10 = ids.find((x) => x.type === "ISBN_10")?.identifier
      const isbn13 = ids.find((x) => x.type === "ISBN_13")?.identifier
      
      return {
        title: v.title?.substring(0, 200) || 'Unknown Title', // Limit title length
        subtitle: v.subtitle?.substring(0, 200),
        description: v.description?.substring(0, 500), // Limit description
        coverUrl: v.imageLinks?.thumbnail?.replace("http://", "https://"),
        authors: v.authors?.slice(0, 5) || [], // Limit authors
        categories: v.categories?.slice(0, 3) || [], // Limit categories
        isbn10,
        isbn13,
        googleVolumeId: it.id,
        priceCents: 1999,
      }
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Google Books API timeout')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Save a Google-sourced book into DB only when needed.
 * Accepts either:
 *  - a normalized record from `searchGoogleBooks` (has googleVolumeId), or
 *  - a raw Google volume (has id, volumeInfo).
 */
export async function ensureBookSaved(googleBook: any) {
  const volumeId: string | undefined =
    googleBook?.googleVolumeId || googleBook?.id
  if (!volumeId) throw new Error("Missing google volume id")

  const existing = await prisma.book.findUnique({
    where: { googleVolumeId: volumeId },
  })
  if (existing) return existing

  // Normalize fields no matter the input shape
  const v = googleBook.volumeInfo || {}
  const title = googleBook.title || v.title || "Untitled"
  const description = googleBook.description || v.description || ""
  const coverUrl =
    googleBook.coverUrl ||
    v.imageLinks?.thumbnail?.replace?.("http://", "https://") ||
    null
  const authors: string[] =
    googleBook.authors || v.authors || []

  return prisma.book.create({
    data: {
      title,
      description,
      coverUrl,
      googleVolumeId: volumeId,
      priceCents: 0,
      currency: "USD",
      inventory: 100,
      authors: {
        connectOrCreate: authors.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  })
}
