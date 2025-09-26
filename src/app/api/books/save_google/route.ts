// FILE: src/app/api/books/save-from-google/route.ts
import { NextResponse } from "next/server"
import { ensureBookSaved } from "../../../lib/book"

export async function POST(req: Request) {
  try {
    const { volumeId, googleData } = await req.json()
    
    // Use your existing ensureBookSaved function
    const book = await ensureBookSaved({
      id: volumeId,
      volumeInfo: googleData.volumeInfo || googleData
    })

    return NextResponse.json({ book })
  } catch (error) {
    console.error("Failed to save Google book:", error)
    return NextResponse.json({ error: "Failed to save book" }, { status: 500 })
  }
}