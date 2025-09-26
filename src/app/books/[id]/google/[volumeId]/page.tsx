// FILE: src/app/books/google/[volumeId]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "../../../../components/Loading"

export default function GoogleBookRedirect({ params }: { params: { volumeId: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function saveAndRedirect() {
      try {
        // Use your existing API to get Google book details and save it
        const res = await fetch(`/api/books/summary?volumeId=${params.volumeId}`)
        if (!res.ok) throw new Error("Failed to fetch book details")
        
        const googleData = await res.json()
        
        // Save the book using your existing ensureBookSaved logic
        const saveRes = await fetch("/api/books/save-from-google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volumeId: params.volumeId,
            googleData: googleData
          }),
        })

        if (!saveRes.ok) throw new Error("Failed to save book")
        
        const { book } = await saveRes.json()
        
        // Redirect to the regular book page
        router.push(`/books/${book.id}`)
        
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load book details")
        setLoading(false)
      }
    }

    saveAndRedirect()
  }, [params.volumeId, router])

  if (loading) return <Loading />
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return <Loading />
}