

//==============================================================
// FILE: src/components/AddToCart.tsx
// DESCRIPTION: Client component for adding a book to cart.
//==============================================================


'use client'


export default function AddToCart({ bookId }: { bookId: string }) {
async function add() {
await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId, qty: 1 }) })
alert('Added to cart')
}
return (
<button onClick={add} className="px-4 py-2 border rounded-xl">Add to Cart</button>
)
}