//==============================================================
// FILE: src/app/checkout/success/page.tsx
// DESCRIPTION: Success page verifies session and clears cart.
//==============================================================

import { prisma } from "../../lib/prisma"
import { NextResponse } from "next/server"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  let ok: boolean | null = null
  if (sessionId) {
    try {
      // verify via internal API
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/verify`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
      const data = await res.json()
      ok = data.ok ?? null
    } catch (err) {
      ok = false
    }
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">
        Payment{" "}
        {ok === true ? "Confirmed" : ok === false ? "Pending" : "Processing..."}
      </h1>
      <p>Thank you for your purchase!</p>
    </div>
  )
}
