//==============================================================
// FILE: src/app/dashboard/new-collection/page.tsx
// DESCRIPTION: Simple form to create a collection.
//==============================================================

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewCollectionPage() {
  const [name, setName] = useState("")
  const r = useRouter()

  async function create() {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ name }),
    })
    if (res.ok) r.push("/dashboard")
    else alert("Failed to create collection")
  }

  return (
    <div className="max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">New Collection</h1>
      <input className="w-full border rounded-xl px-3 py-2" placeholder="Collection name"
             value={name} onChange={(e)=>setName(e.target.value)} />
      <button onClick={create} className="w-full border rounded-xl py-2">Create</button>
    </div>
  )
}
