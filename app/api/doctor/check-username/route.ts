import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface UsernameCheckResult {
  id: number
  usuario: string
}

async function getUserFromCookie() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("doutopAuth")

  if (!authCookie?.value) return null

  try {
    const users = await query<{ id: number; usuario: string; role: string }>(
      `SELECT id, usuario, role FROM users WHERE jwd = ? LIMIT 1`,
      [authCookie.value]
    )
    return users[0] || null
  } catch {
    return null
  }
}

function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (!username || username.length === 0) {
    return { valid: false, error: "El usuario es requerido" }
  }

  if (username.length < 3) {
    return { valid: false, error: "Mínimo 3 caracteres" }
  }

  if (username.length > 50) {
    return { valid: false, error: "Máximo 50 caracteres" }
  }

  if (!/^[a-z0-9]/.test(username)) {
    return { valid: false, error: "Debe comenzar con letra o número" }
  }

  if (!/^[a-z0-9-]+$/.test(username)) {
    return { valid: false, error: "Solo letras minúsculas, números y guiones" }
  }

  if (/--/.test(username)) {
    return { valid: false, error: "No puede tener guiones consecutivos" }
  }

  if (/-$/.test(username)) {
    return { valid: false, error: "No puede terminar en guión" }
  }

  const reservedUsernames = [
    "admin", "api", "login", "logout", "register", "signup", "signin",
    "dashboard", "settings", "configuraciones", "perfil", "profile",
    "doctor", "doctores", "paciente", "pacientes", "user", "users",
    "beneficios", "planes", "pendiente", "sobre-mi", "tratamientos",
    "robots", "sitemap", "manifest", "favicon", "public", "static",
    "assets", "images", "uploads", "doctors", "doctors-uploads"
  ]

  if (reservedUsernames.includes(username)) {
    return { valid: false, error: "Este nombre de usuario está reservado" }
  }

  return { valid: true }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromCookie()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Usuario no especificado" },
        { status: 400 }
      )
    }

    const normalized = normalizeUsername(username)
    const formatValidation = validateUsernameFormat(normalized)

    if (!formatValidation.valid) {
      return NextResponse.json({
        success: true,
        available: false,
        normalized,
        reason: "invalid_format",
        message: formatValidation.error,
      })
    }

    const existing = await query<UsernameCheckResult>(
      `SELECT id, usuario FROM users WHERE usuario = ? LIMIT 1`,
      [normalized]
    )

    if (existing.length > 0 && existing[0].id !== currentUser.id) {
      return NextResponse.json({
        success: true,
        available: false,
        normalized,
        reason: "taken",
        message: "Este usuario ya está en uso",
      })
    }

    const isOwn = existing.length > 0 && existing[0].id === currentUser.id

    return NextResponse.json({
      success: true,
      available: true,
      normalized,
      isOwn,
      message: isOwn ? "Este es tu usuario actual" : "Usuario disponible",
    })
  } catch (error) {
    console.error("[API check-username] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al verificar disponibilidad" },
      { status: 500 }
    )
  }
}
