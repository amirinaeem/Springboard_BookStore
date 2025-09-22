//==============================================================
// FILE: src/middleware.ts
// DESCRIPTION: Protect /admin routes (example).
//==============================================================


import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export function middleware(req: NextRequest) {
if (req.nextUrl.pathname.startsWith('/admin')) {
// In a real app, call auth() here using edge-safe approach or route handler.
// For demo, just block (customize as needed).
return NextResponse.redirect(new URL('/', req.url))
}
}


export const config = { matcher: ['/admin/:path*'] }

