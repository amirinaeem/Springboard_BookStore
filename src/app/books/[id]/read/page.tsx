//==============================================================
// PAGE: BookReadPage
// DESCRIPTION: Ownership-guarded online reader (BookViewer).
//              Streams via /api/books/[id]/download?inline=1
//==============================================================

import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { notFound } from "next/navigation"
import BookViewer from "../../../components/BookViewer"
import ReaderHeader from "../../../components/ReaderHeader"

export default async function BookReadPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      orderItems: { where: { order: { userId, status: "PAID" } } },
    },
  })

  if (!book) return notFound()
  if (book.orderItems.length === 0) {
    return <p className="p-6 text-red-600">Access denied</p>
  }

  // Always go through the API route so it can ensure Cloudinary upload
  const streamUrl = `/api/books/${book.id}/download?inline=1`

  return (
    <div className="p-4 h-screen flex flex-col">
      <ReaderHeader title={book.title} />
      <BookViewer fileUrl={streamUrl} bookId={book.id} />
    </div>
  )
}
