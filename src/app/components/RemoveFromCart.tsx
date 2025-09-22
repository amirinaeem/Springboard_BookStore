//==============================================================
// FILE: src/components/RemoveFromCart.tsx
// DESCRIPTION: Client button to remove a book from the cart.
//==============================================================
'use client'

import { useRouter } from 'next/navigation'

export default function RemoveFromCart({ bookId }: { bookId: string }) {
  const r = useRouter()
  async function removeIt() {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    })
    if (res.ok) r.refresh()
    else alert('Failed to remove item')
  }
  return (
    <button onClick={removeIt} className="px-3 py-1 rounded-xl border hover:bg-gray-100">
      Remove
    </button>
  )
}
