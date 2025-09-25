//==============================================================
// PAGE: Checkout Success
// DESCRIPTION: Confirms payment, clears cart, lists purchased
//              items with "View Online" and "Download" actions.
//==============================================================

export default async function SuccessPage({
  searchParams,
}: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id

  let ok: boolean | null = null
  let items: any[] = []

  if (sessionId) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/verify`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
      const data = await res.json()
      ok = data.ok ?? null
      items = data.items || []
    } catch {
      ok = false
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Payment {ok === true ? "Confirmed" : ok === false ? "Pending" : "Processing..."}
      </h1>
      <p>Thank you for your purchase!</p>

      {ok === true && items.length > 0 && (
        <div className="space-y-2">
          <p>Your books are ready:</p>
          <ul className="list-disc pl-6 space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span>{item.book.title}</span>

                {/* View Online (goes to reader; reader will fallback to inline stream if needed) */}
                <a
                  href={`/books/${item.book.id}/read`}
                  className="inline-block px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  View Online
                </a>

                {/* Download (attachment) */}
                <a
                  href={`/api/books/${item.book.id}/download`}
                  className="inline-block px-4 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
