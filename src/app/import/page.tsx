//==============================================================
// FILE: src/app/import/page.tsx
// DESCRIPTION: UI to import books from Google Books by query.
//==============================================================

import { redirect } from "next/navigation"

export default async function ImportPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q?.trim() || ""

  if (!q) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-2">Import</h1>
        <p>No query provided.</p>
      </div>
    )
  }

  // Call your API to import
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/books/search?q=${encodeURIComponent(q)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  let msg = "Failed to import"
  if (res.ok) {
    const j = await res.json()
    msg = `Imported ${j.items?.length || 0} books`
  }

  // After import, redirect back to search results
  redirect(`/?q=${encodeURIComponent(q)}`)

  // This will render briefly if redirect doesn’t happen instantly
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Importing "{q}"</h1>
      <p>{msg}</p>
    </div>
  )
}
