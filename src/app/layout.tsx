//==============================================================
// FILE: src/app/layout.tsx
// DESCRIPTION: Root layout: global styles, Providers, Navbar container.
//==============================================================

import "./globals.css"
import Providers from "./components/Providers"
import Navbar from "./components/Navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
