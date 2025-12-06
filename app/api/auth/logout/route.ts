import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost"

export async function POST() {
  try {
    await destroySession()

    const response = NextResponse.json({ success: true, message: "Sesión cerrada" })

    response.cookies.set("doutopAuth", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: COOKIE_DOMAIN,
      maxAge: 0,
      expires: new Date(0),
    })

    return response
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
