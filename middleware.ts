import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to setup, login page and API routes
  if (
    pathname.startsWith("/setup") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Check authentication
  try {
    const { getSession } = await import("@/lib/auth")
    const user = await getSession()

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
