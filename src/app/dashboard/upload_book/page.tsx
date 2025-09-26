"use client"

import { useState } from "react"

export default function NewBookPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch("/api/books/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      window.location.href = "/"
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Upload a Book</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input name="title" required className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block font-medium">Author</label>
          <input name="author" required className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block font-medium">Summary</label>
          <textarea name="description" rows={4} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block font-medium">Release Date</label>
          <input type="date" name="publishedAt" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block font-medium">Cover Image</label>
          <input type="file" name="cover" accept="image/*" required />
        </div>

        <div>
          <label className="block font-medium">Book File (PDF/EPUB)</label>
          <input type="file" name="file" accept=".pdf,.epub" required />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload Book"}
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
