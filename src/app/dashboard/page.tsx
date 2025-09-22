//==============================================================
// FILE: src/app/dashboard/page.tsx
// DESCRIPTION: User dashboard: collections and recent orders.
//==============================================================

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "../lib/prisma"

async function getData(userId: string) {
  const [collections, orders] = await Promise.all([
    prisma.collection.findMany({
      where: { userId },
      include: { items: { include: { book: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId },
      include: { items: { include: { book: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])
  return { collections, orders }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id as string | undefined
  if (!userId) return <div>Please sign in.</div>

  const { collections, orders } = await getData(userId)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Your Dashboard</h1>

      {/* Collections */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collections</h2>
          <form action="/dashboard/new-collection" method="get">
            <button className="border rounded-xl px-3 py-2">New Collection</button>
          </form>
        </div>

        {collections.length === 0 && <p className="opacity-80">No collections yet.</p>}

        <div className="grid md:grid-cols-2 gap-3">
          {collections.map((c) => (
            <div key={c.id} className="border rounded-2xl p-4">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm opacity-70">{c.items.length} item(s)</div>
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {c.items.slice(0,6).map((it)=>(
                  <img key={it.id} src={it.book.coverUrl || ""} className="w-12 h-16 rounded-md object-cover" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        {orders.length === 0 && <p className="opacity-80">No orders yet.</p>}

        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.items.length} items</div>
                <div className="text-sm opacity-70">{o.status}</div>
              </div>
              <div className="font-semibold">${(o.totalCents/100).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
