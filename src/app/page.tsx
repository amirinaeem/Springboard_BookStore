//==============================================================
// FILE: src/app/page.tsx
// DESCRIPTION: Home page with search and top 20 recent books.
//==============================================================

import Link from "next/link"
import BookCard from "./components/BookCard"
import { prisma } from "./lib/prisma"
import { Prisma } from "@prisma/client"

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q?.trim() || ""

  // Use Prisma.QueryMode instead of plain string
  const where: Prisma.BookWhereInput = q
    ? { title: { contains: q, mode: Prisma.QueryMode.insensitive } }
    : {}

  const books = await prisma.book.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form className="flex gap-2" action="/">
        <input
          name="q"
          defaultValue={q}
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Search books..."
        />
        <button className="px-4 py-2 rounded-xl border">Search</button>
      </form>

      {/* Import suggestion */}
      {q && (
        <p>
          Showing results for <strong>{q}</strong>. Missing results?
          <Link
            href={`/import?q=${encodeURIComponent(q)}`}
            className="ml-1 underline"
          >
            Import from Google
          </Link>
        </p>
      )}

      {/* Book grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  )
}
