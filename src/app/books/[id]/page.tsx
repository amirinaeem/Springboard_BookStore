//==============================================================
// PAGE: BookPage
// DESCRIPTION: Book details + purchase + collections + reviews.
//              Uses BookReadLink for read/buy and correct download.
//==============================================================

import { prisma } from "../../lib/prisma"
import AddToCart from "../../components/AddToCart"
import AddToCollection from "../../components/AddToCollection"
import BookReadLink from "../../components/BookReadLink"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function BookPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      authors: true,
      categories: true,
      reviews: true,
      orderItems: { where: { order: { userId, status: "PAID" } } },
    },
  })
  if (!book) return notFound()

  const owned = book.orderItems.length > 0
  const description = book.description || "(No description yet.)"

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        {book.coverUrl && (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="rounded-xl w-full object-cover shadow-lg"
          />
        )}

        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          {book.subtitle && <p className="text-lg text-gray-600">{book.subtitle}</p>}
          <p className="text-sm text-gray-500">
            {book.authors.map((a) => a.name).join(", ")}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-bold">
              ${(book.priceCents / 100).toFixed(2)}
            </span>

            {!owned && <AddToCart bookId={book.id} />}
            <AddToCollection bookId={book.id} />

            {book.fileUrl && (
              <>
                {/* Read / buy smart link */}
                <BookReadLink bookId={book.id} owned={owned} />
                {/* Download only if owned */}
                {owned && (
                  <Link
                    href={`/api/books/${book.id}/download`}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition"
                  >
                    Download
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <details className="border rounded-2xl p-4">
        <summary className="cursor-pointer font-medium">Summary</summary>
        <p className="mt-2 whitespace-pre-wrap">{description}</p>
      </details>

      <div>
        <h2 className="mt-6 mb-2 text-lg font-semibold">Reviews</h2>
        {book.reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="space-y-2">
            {book.reviews.map((r) => (
              <li key={r.id} className="border rounded-2xl p-3">
                <strong>{r.rating}/5</strong>
                <p>{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
