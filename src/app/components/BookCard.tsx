//==============================================================
// COMPONENT: BookCard
// DESCRIPTION: Book tile with cover, meta, collection, and
//              optional smart read button when `owned` provided.
//==============================================================

// FILE: src/app/components/BookCard.tsx
"use client"

import Link from "next/link"
import AddToCollection from "./AddToCollection"
import BookReadLink from "./BookReadLink"
import AddToCart from "./AddToCart"

export default function BookCard({
  book,
  owned,
  fromGoogle,
}: {
  book: any
  owned?: boolean
  fromGoogle?: boolean
}) {
  const cover = book.coverUrl || book.imageLinks?.thumbnail || ""
  
  // Determine the link URL using your existing infrastructure
  const getBookLink = () => {
    if (book.id) {
      // Book is already in our DB - use regular book page
      return `/books/${book.id}`
    } else if (book.googleVolumeId) {
      // Book is from Google - use your existing ensureBookSaved flow
      return `/books/google/${book.googleVolumeId}`
    }
    return "#"
  }

  const bookLink = getBookLink()

  return (
    <div className="border rounded-xl p-3 flex flex-col hover:shadow transition">
      <Link
        href={bookLink}
        className="block group"
      >
        <img
          src={cover}
          alt={book.title}
          className="rounded-md w-full h-48 object-cover group-hover:opacity-90"
        />
        <div className="mt-2">
          <div className="font-medium line-clamp-2 min-h-[3rem]">
            {book.title}
          </div>
          <div className="mt-1 text-sm">
            ${((book.priceCents ?? 1999) / 100).toFixed(2)}
          </div>
        </div>
      </Link>

      <div className="mt-3 flex gap-2">
        <AddToCollection book={book} fromGoogle={fromGoogle} />
        <AddToCart book={book} fromGoogle={fromGoogle} />
        {typeof owned === "boolean" && book.id && (
          <BookReadLink
            bookId={book.id}
            owned={owned}
            className="flex-1 text-center"
          />
        )}
      </div>
    </div>
  )
}


