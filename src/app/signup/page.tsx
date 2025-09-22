//==============================================================
// FILE: src/app/signup/page.tsx
// DESCRIPTION: Sign-up page creating credential users.
//==============================================================

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const r = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ name, email, password })
    })
    if (res.ok) r.push("/signin")
    else alert("Sign up failed")
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Name"
               value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Email"
               value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full border rounded-xl py-2">Create account</button>
      </form>
    </div>
  )
}
