//==============================================================
// FILE: src/app/import/page.tsx
// DESCRIPTION: UI to import books from Google Books by query.
//==============================================================


'use client'


import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'


export default function ImportPage() {
const sp = useSearchParams()
const r = useRouter()
const q = sp.get('q') || ''
const [loading, setLoading] = useState(false)
const [msg, setMsg] = useState('')


async function run() {
if (!q) return
setLoading(true)
const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
const j = await res.json()
setMsg(`Imported ${j.items?.length || 0} books`)
setLoading(false)
setTimeout(() => r.push(`/?q=${encodeURIComponent(q)}`), 1200)
}


useEffect(() => {
if (q) run()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [q])


return (
<div>
<h1 className="text-2xl font-semibold mb-2">Importing "{q}"</h1>
<p>{loading ? 'Importing from Google Books...' : msg || 'Waiting...'}</p>
</div>
)
}

