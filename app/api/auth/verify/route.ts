import { NextResponse, type NextRequest } from "next/server"
import { findUserByJwd, getCookieName, clearSessionCookie } from "@/lib/auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cookieName = "alobaAuth"

  try {
    const cookieStore = await cookies()
    const jwd = cookieStore.get(cookieName)?.value

    // CASE 1: No cookie present
    if (!jwd || jwd.trim() === "") {
      return NextResponse.json(
        {
          authenticated: false,
          error: "No session cookie",
          action: "none",
        },
        { status: 401 },
      )
    }

    // CASE 2: Verify token against database
    const user = await findUserByJwd(jwd)

    if (!user) {
      // Token no encontrado en BD → limpiar cookie
      console.log("[verify] Invalid token detected, clearing cookie")
      await clearSessionCookie()

      return NextResponse.json(
        {
          authenticated: false,
          error: "Invalid session token",
          action: "cookie_cleared",
        },
        { status: 401 },
      )
    }

    // CASE 3: Valid session - return user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        googleId: user.google_id,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        picture: user.picture,
        locale: user.locale,
        role: user.role,
        estado: (user as any).estado || 'pendiente',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
      },
    })
  } catch (error) {
    // CASE 4: Database or unexpected error
    console.error("[verify] Verification error:", error)
    await clearSessionCookie()

    return NextResponse.json(
      {
        authenticated: false,
        error: "Verification failed",
        action: "cookie_cleared",
      },
      { status: 401 },
    )
  }
}
