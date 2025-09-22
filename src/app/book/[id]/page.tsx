//==============================================================
// FILE: src/app/book/[id]/page.tsx
// DESCRIPTION: Book details with summary, add-to-cart/collection,
//              reviews, and conditional download for paid owners.
//==============================================================

import { prisma } from "../../lib/prisma"
import AddToCart from "../../components/AddToCart"
import AddToCollection from "../../components/AddToCollection"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"

export default async function BookPage({ params }: { params: { id: string } }) {
  const [book, session] = await Promise.all([
    prisma.book.findUnique({
      where: { id: params.id },
      include: { reviews: true },
    }),
    getServerSession(authOptions),
  ])

  if (!book) return <div>Not found</div>

  // Check ownership (paid order with this book)
  const userId = session?.user?.id as string | undefined
  let canDownload = false
  if (userId) {
    const owned = await prisma.orderItem.findFirst({
      where: {
        bookId: book.id,
        order: { userId, status: "PAID" },
      },
      select: { id: true },
    })
    canDownload = !!owned
  }

  const description = book.description || "(No description yet. Try the summary tab.)"

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <img src={book.coverUrl || ""} alt={book.title} className="rounded-xl w-full" />
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold">{book.title}</h1>
        <p className="text-sm opacity-80">{book.subtitle}</p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xl font-bold">${(book.priceCents / 100).toFixed(2)}</span>
          <AddToCart bookId={book.id} />
          <AddToCollection bookId={book.id} />

          {book.fileUrl && canDownload && (
            <Link
              href={`/api/books/${book.id}/download`}
              className="border rounded-xl px-3 py-2"
            >
              Download
            </Link>
          )}
        </div>

        <details className="border rounded-2xl p-3">
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
    </div>
  )
}
