//==============================================================
// FILE: src/components/Navbar.tsx
// DESCRIPTION: Navbar with cart, dashboard (if signed-in), auth icons.
//==============================================================

'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { LogOut, Github, Mail, BookOpenText } from 'lucide-react'
import Image from 'next/image'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpenText className="w-6 h-6" />
          {process.env.NEXT_PUBLIC_APP_NAME || 'Bookstore'}
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link href="/cart" className="hover:underline">Cart</Link>

          {session?.user && (
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          )}

          {session?.user ? (
            <>
              {/* Avatar or fallback */}
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full border"
                />
              ) : (
                <span className="opacity-80 text-sm">
                  Hi, {session.user.name || session.user.email}
                </span>
              )}
              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl border hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => signIn('credentials')}
                className="p-2 rounded-xl border hover:bg-gray-100"
                title="Sign in with Email"
              >
                <Mail className="w-4 h-4" />
              </button>
              {process.env.NEXT_PUBLIC_GITHUB_ID && (
                <button
                  onClick={() => signIn('github')}
                  className="p-2 rounded-xl border hover:bg-gray-100"
                  title="Sign in with GitHub"
                >
                  <Github className="w-4 h-4" />
                </button>
              )}
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <button
                  onClick={() => signIn('google')}
                  className="p-2 rounded-xl border hover:bg-gray-100"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C36.52 2.98 30.7 0 24 0 14.62 0 6.44 5.48 2.56 13.44l7.98 6.19C12.09 13.26 17.55 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.15-3.14-.42-4.64H24v9.07h12.7c-.55 2.95-2.2 5.46-4.7 7.15l7.18 5.57c4.18-3.86 6.52-9.54 6.52-17.15z"/>
                    <path fill="#FBBC05" d="M10.54 28.62c-1.21-3.56-1.21-7.45 0-11.01l-7.98-6.19C-1.07 16.15-1.07 31.85 2.56 40.57l7.98-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.91-2.13 15.88-5.78l-7.18-5.57c-2.02 1.36-4.61 2.15-7.61 2.15-6.45 0-11.91-3.76-13.46-9.06l-7.98 6.19C6.44 42.52 14.62 48 24 48z"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
