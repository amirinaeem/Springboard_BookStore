//==============================================================
// FILE: src/components/BookCard.tsx
// DESCRIPTION: Card component for listing a book with quick actions.
//==============================================================

import Link from 'next/link'
import AddToCollection from './AddToCollection'

export default function BookCard({ book }: { book: any }) {
  return (
    <div className="border rounded-xl p-3 flex flex-col">
      <Link href={`/book/${book.id}`} className="block">
        <img src={book.coverUrl || ''} alt={book.title} className="rounded-md w-full h-48 object-cover" />
        <div className="mt-2">
          <div className="font-medium line-clamp-2 min-h-[3rem]">{book.title}</div>
          <div className="mt-1 text-sm">${(book.priceCents / 100).toFixed(2)}</div>
        </div>
      </Link>
      <div className="mt-3">
        <AddToCollection bookId={book.id} />
      </div>
    </div>
  )
}
