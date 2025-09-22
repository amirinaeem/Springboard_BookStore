//==============================================================
// FILE: src/app/checkout/success/page.tsx
// DESCRIPTION: Success page verifies session and clears cart.
//==============================================================


'use client'


import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'


export default function SuccessPage() {
const sp = useSearchParams()
const [ok, setOk] = useState<boolean | null>(null)
useEffect(() => {
const id = sp.get('session_id')
if (!id) return
fetch('/api/orders/verify', { method: 'POST', body: JSON.stringify({ session_id: id }) })
.then((r) => r.json())
.then((j) => setOk(j.ok))
}, [sp])
return (
<div className="space-y-2">
<h1 className="text-2xl font-semibold">Payment {ok ? 'Confirmed' : ok === false ? 'Pending' : '...'}</h1>
<p>Thank you for your purchase!</p>
</div>
)
}

