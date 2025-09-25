//==============================================================
// COMPONENT: BookCard
// DESCRIPTION: Book tile with cover, meta, collection, and
//              optional smart read button when `owned` provided.
//==============================================================

"use client"

import Link from "next/link"
import AddToCollection from "./AddToCollection"
import BookReadLink from "./BookReadLink"

export default function BookCard({ book, owned }: { book: any; owned?: boolean }) {
  return (
    <div className="border rounded-xl p-3 flex flex-col">
      <Link href={`/books/${book.id}`} className="block">
        <img
          src={book.coverUrl || ""}
          alt={book.title}
          className="rounded-md w-full h-48 object-cover"
        />
        <div className="mt-2">
          <div className="font-medium line-clamp-2 min-h-[3rem]">{book.title}</div>
          <div className="mt-1 text-sm">${(book.priceCents / 100).toFixed(2)}</div>
        </div>
      </Link>

      <div className="mt-3 flex gap-2">
        <AddToCollection bookId={book.id} />
        {typeof owned === "boolean" && (
          <BookReadLink bookId={book.id} owned={owned} className="flex-1 text-center" />
        )}
      </div>
    </div>
  )
}
