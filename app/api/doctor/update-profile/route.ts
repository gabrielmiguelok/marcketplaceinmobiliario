import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

interface UpdateProfileRequest {
  full_name?: string
  first_name?: string
  last_name?: string
  especialidad?: string
  cedula_profesional?: string
  direccion_consultorio?: string
  bio?: string
  instagram?: string
  linkedin?: string
  whatsapp?: string
  telefono?: string
  anos_experiencia?: number
  pacientes_atendidos?: number
  picture?: string
}

const ALLOWED_FIELDS = [
  "usuario",
  "full_name",
  "first_name",
  "last_name",
  "especialidad",
  "cedula_profesional",
  "direccion_consultorio",
  "bio",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "facebook",
  "twitter",
  "whatsapp",
  "telefono",
  "enlace_citas",
  "google_maps",
  "anos_experiencia",
  "pacientes_atendidos",
  "picture",
]

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
    return { valid: true }
  }

  if (username.length < 3) {
    return { valid: false, error: "El usuario debe tener mínimo 3 caracteres" }
  }

  if (username.length > 50) {
    return { valid: false, error: "El usuario debe tener máximo 50 caracteres" }
  }

  if (!/^[a-z0-9]/.test(username)) {
    return { valid: false, error: "El usuario debe comenzar con letra o número" }
  }

  if (!/^[a-z0-9-]+$/.test(username)) {
    return { valid: false, error: "El usuario solo puede contener letras minúsculas, números y guiones" }
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

async function checkUsernameAvailability(username: string, currentUserId: number): Promise<{ available: boolean; error?: string }> {
  const existing = await query<{ id: number }>(
    `SELECT id FROM users WHERE usuario = ? AND id != ? LIMIT 1`,
    [username, currentUserId]
  )

  if (existing.length > 0) {
    return { available: false, error: "Este nombre de usuario ya está en uso" }
  }

  return { available: true }
}

async function getUserFromCookie() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("doutopAuth")

  if (!authCookie?.value) return null

  try {
    const users = await query<{ id: number; usuario: string; role: string; estado: string }>(
      `SELECT id, usuario, role, estado FROM users WHERE jwd = ? LIMIT 1`,
      [authCookie.value]
    )
    return users[0] || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromCookie()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    if (currentUser.role !== "doctor" && currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      )
    }

    if (currentUser.estado !== "confirmado") {
      return NextResponse.json(
        { success: false, error: "Cuenta pendiente de aprobación" },
        { status: 403 }
      )
    }

    const body: UpdateProfileRequest & { targetUsuario?: string } = await request.json()

    let targetUserId = currentUser.id

    if (body.targetUsuario && currentUser.role === "admin") {
      const targetUser = await query<{ id: number }>(
        `SELECT id FROM users WHERE usuario = ? LIMIT 1`,
        [body.targetUsuario]
      )
      if (targetUser[0]) {
        targetUserId = targetUser[0].id
      }
    }

    delete body.targetUsuario

    if (body.usuario !== undefined && body.usuario !== null && body.usuario !== "") {
      const normalizedUsername = normalizeUsername(body.usuario as string)

      const formatValidation = validateUsernameFormat(normalizedUsername)
      if (!formatValidation.valid) {
        return NextResponse.json(
          { success: false, error: formatValidation.error },
          { status: 400 }
        )
      }

      const availabilityCheck = await checkUsernameAvailability(normalizedUsername, targetUserId)
      if (!availabilityCheck.available) {
        return NextResponse.json(
          { success: false, error: availabilityCheck.error, code: "USERNAME_TAKEN" },
          { status: 409 }
        )
      }

      body.usuario = normalizedUsername
    }

    const updates: string[] = []
    const values: (string | number | null)[] = []

    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`)
        values.push(value === "" ? null : value)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay campos para actualizar" },
        { status: 400 }
      )
    }

    values.push(targetUserId)

    try {
      await query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      )
    } catch (dbError: any) {
      if (dbError.code === "ER_DUP_ENTRY" && dbError.message?.includes("usuario")) {
        return NextResponse.json(
          { success: false, error: "Este nombre de usuario ya está en uso", code: "USERNAME_TAKEN" },
          { status: 409 }
        )
      }
      throw dbError
    }

    const updatedUser = await query<Record<string, unknown>>(
      `SELECT id, usuario, full_name, first_name, last_name, picture,
              especialidad, cedula_profesional, direccion_consultorio,
              bio, instagram, linkedin, youtube, tiktok, facebook, twitter,
              whatsapp, telefono, enlace_citas, google_maps,
              anos_experiencia, pacientes_atendidos
       FROM users WHERE id = ?`,
      [targetUserId]
    )

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: updatedUser[0],
    })
  } catch (error) {
    console.error("[API doctor/update-profile] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al actualizar el perfil" },
      { status: 500 }
    )
  }
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
    const targetUsuario = searchParams.get("usuario")

    let targetUserId = currentUser.id

    if (targetUsuario && currentUser.role === "admin") {
      const targetUser = await query<{ id: number }>(
        `SELECT id FROM users WHERE usuario = ? LIMIT 1`,
        [targetUsuario]
      )
      if (targetUser[0]) {
        targetUserId = targetUser[0].id
      }
    }

    const profile = await query<Record<string, unknown>>(
      `SELECT id, usuario, email, full_name, first_name, last_name, picture,
              especialidad, cedula_profesional, direccion_consultorio,
              bio, instagram, linkedin, youtube, tiktok, facebook, twitter,
              whatsapp, telefono, enlace_citas, google_maps,
              anos_experiencia, pacientes_atendidos, role, estado
       FROM users WHERE id = ?`,
      [targetUserId]
    )

    if (!profile[0]) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile[0],
    })
  } catch (error) {
    console.error("[API doctor/update-profile GET] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener el perfil" },
      { status: 500 }
    )
  }
}
