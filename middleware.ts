import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "alobaAuth"

const PUBLIC_API_PATHS = [
  "/api/auth",
  "/api/inmuebles/search",
  "/api/search-filters",
  "/api/imagen",
  "/api/chat-business-info",
]

const PUBLIC_GET_ONLY_PATHS = [
  "/api/inmuebles",
]

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

function isPublicGetOnlyPath(pathname: string): boolean {
  return PUBLIC_GET_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next()

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    if (isPublicApiPath(pathname)) {
      return NextResponse.next()
    }

    if (isPublicGetOnlyPath(pathname) && request.method === "GET") {
      return NextResponse.next()
    }

    if (token) {
      return NextResponse.next()
    }

    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
