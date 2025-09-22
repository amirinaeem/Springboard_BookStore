//==============================================================
// FILE: src/app/signin/page.tsx
// DESCRIPTION: Sign-in page (Credentials + OAuth provider icons).
//==============================================================

'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Github, Mail } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    })
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

      {/* Credentials form */}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full border rounded-xl py-2">Sign in</button>
      </form>

      <div className="my-4 text-center opacity-70">or</div>

      {/* OAuth providers with icons only */}
      <div className="flex justify-center gap-4">
        {/* GitHub login */}
        {process.env.NEXT_PUBLIC_GITHUB_ID && (
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="p-3 border rounded-xl hover:bg-gray-100"
            title="Sign in with GitHub"
          >
            <Github className="w-5 h-5" />
          </button>
        )}

        {/* Google login */}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="p-3 border rounded-xl hover:bg-gray-100"
            title="Sign in with Google"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C36.52 2.98 30.7 0 24 0 14.62 0 6.44 5.48 2.56 13.44l7.98 6.19C12.09 13.26 17.55 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.6-.15-3.14-.42-4.64H24v9.07h12.7c-.55 2.95-2.2 5.46-4.7 7.15l7.18 5.57c4.18-3.86 6.52-9.54 6.52-17.15z"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.62c-1.21-3.56-1.21-7.45 0-11.01l-7.98-6.19C-1.07 16.15-1.07 31.85 2.56 40.57l7.98-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.91-2.13 15.88-5.78l-7.18-5.57c-2.02 1.36-4.61 2.15-7.61 2.15-6.45 0-11.91-3.76-13.46-9.06l-7.98 6.19C6.44 42.52 14.62 48 24 48z"
              />
            </svg>
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-center">
        Don&apos;t have an account?{" "}
        <a className="underline" href="/signup">
          Create one
        </a>
      </p>
    </div>
  )
}
