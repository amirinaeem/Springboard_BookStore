// FILE: src/app/api/books/search/route.ts
import { prisma } from "../../../lib/prisma"
import { searchGoogleBooks } from "../../../lib/book"
import { NextResponse } from "next/server"

// Rate limiting storage (in-memory for simplicity, use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100 // requests per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const userRequests = requestCounts.get(ip)
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (userRequests.count >= RATE_LIMIT) {
    return true
  }
  
  userRequests.count++
  return false
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() || ""
  
  // Get client IP for rate limiting
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

  // 1) Validate query
  if (!q) {
    return NextResponse.json({ 
      error: "Query parameter 'q' is required" 
    }, { status: 400 })
  }

  if (q.length < 2) {
    return NextResponse.json({ 
      error: "Query must be at least 2 characters long" 
    }, { status: 400 })
  }

  if (q.length > 100) {
    return NextResponse.json({ 
      error: "Query too long (max 100 characters)" 
    }, { status: 400 })
  }

  // 2) Rate limiting
  if (isRateLimited(ip)) {
    return NextResponse.json({ 
      error: "Rate limit exceeded. Please try again later." 
    }, { status: 429 })
  }

  // 3) Set timeout for the entire operation
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), 10000) // 10 second timeout
  })

  try {
    const searchPromise = (async () => {
      // 1) ALWAYS search Google first for comprehensive results
      const googleResults = await searchGoogleBooks(q)
      
      // Limit Google results to prevent huge responses
      const limitedGoogleResults = googleResults.slice(0, 20)
      
      // 2) Also search DB to find which Google results are already saved
      const googleVolumeIds = limitedGoogleResults.map(b => b.googleVolumeId).filter(Boolean)
      
      const existingBooks = await prisma.book.findMany({
        where: { 
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { googleVolumeId: { in: googleVolumeIds } }
          ]
        },
        take: 20, // Limit DB results too
        include: { authors: true, categories: true },
      })

      // 3) Combine: Use Google results but replace with DB versions when they exist
      const combinedResults = limitedGoogleResults.map(googleBook => {
        // Find if this Google book already exists in our DB
        const existingBook = existingBooks.find(dbBook => 
          dbBook.googleVolumeId === googleBook.googleVolumeId
        )
        
        // If found in DB, use the DB version (with proper ID and relationships)
        if (existingBook) {
          return {
            ...googleBook,
            id: existingBook.id, // This makes it clickable!
            inDb: true,
            // Keep Google data but prioritize DB relationships
            authors: existingBook.authors || googleBook.authors,
            categories: existingBook.categories || googleBook.categories,
          }
        }
        
        // Otherwise, return Google book as-is (will be clickable via Google route)
        return { ...googleBook, inDb: false }
      })

      return NextResponse.json({ 
        items: combinedResults, 
        source: "google",
        dbCount: existingBooks.length,
        totalResults: combinedResults.length
      })
    })()

    // Race between search and timeout
    return await Promise.race([searchPromise, timeoutPromise])

  } catch (err) {
    console.error("Search error:", err)
    
    if (err instanceof Error && err.message === "Request timeout") {
      return NextResponse.json({ 
        error: "Search timeout. Please try a simpler query." 
      }, { status: 408 })
    }

    // Fallback to DB only if Google fails
    try {
      const dbBooks = await prisma.book.findMany({
        where: { 
          title: { 
            contains: q.substring(0, 50), // Limit query length for DB
            mode: "insensitive" 
          } 
        },
        take: 10, // Return fewer results in fallback mode
        include: { authors: true, categories: true },
      })
      
      return NextResponse.json({ 
        items: dbBooks, 
        source: "db-fallback",
        error: "Google search failed, showing local results only"
      })
    } catch (dbError) {
      console.error("DB fallback also failed:", dbError)
      return NextResponse.json({ 
        error: "Search service temporarily unavailable" 
      }, { status: 503 })
    }
  }
}