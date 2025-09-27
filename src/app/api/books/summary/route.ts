//==============================================================
// FILE: src/app/api/books/summary/route.ts
// DESCRIPTION: Fetch Google Books volume details by volumeId or ISBN.
//==============================================================

import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const volumeId = searchParams.get("volumeId")
  const isbn = searchParams.get("isbn")
  const key = process.env.GOOGLE_BOOKS_API_KEY

  let url: string | null = null
  if (volumeId) {
    url = `https://www.googleapis.com/books/v1/volumes/${volumeId}${key ? `?key=${key}` : ""}`
  } else if (isbn) {
    const q = encodeURIComponent(`isbn:${isbn}`)
    url = `https://www.googleapis.com/books/v1/volumes?q=${q}${key ? `&key=${key}` : ""}`
  } else {
    return NextResponse.json({ error: "Missing volumeId or isbn" }, { status: 400 })
  }

  const res = await fetch(url)
  if (!res.ok) return NextResponse.json({ error: "Google API failed" }, { status: 500 })
  const data = await res.json()
  return NextResponse.json(data)
}
