import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import sharp from "sharp"

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

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const targetUsuario = formData.get("targetUsuario") as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se envió ningún archivo" },
        { status: 400 }
      )
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Formato no válido. Usa JPG, PNG o WebP" },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "La imagen no puede superar 10MB" },
        { status: 400 }
      )
    }

    let targetUserId = currentUser.id
    let usuario = currentUser.usuario

    if (targetUsuario && currentUser.role === "admin") {
      const targetUser = await query<{ id: number; usuario: string }>(
        `SELECT id, usuario FROM users WHERE usuario = ? LIMIT 1`,
        [targetUsuario]
      )
      if (targetUser[0]) {
        targetUserId = targetUser[0].id
        usuario = targetUser[0].usuario
      }
    }

    const existingUser = await query<{ picture: string | null }>(
      `SELECT picture FROM users WHERE id = ?`,
      [targetUserId]
    )

    if (existingUser[0]?.picture && existingUser[0].picture.startsWith("/doctors-uploads/")) {
      try {
        const oldImagePath = path.join(process.cwd(), "public", existingUser[0].picture)
        await unlink(oldImagePath)
        console.log(`📥 [UPLOAD] Imagen anterior eliminada: ${existingUser[0].picture}`)
      } catch {
      }
    }

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const filename = `doctor-${usuario}-${timestamp}-${randomStr}.webp`

    const uploadsDir = path.join(process.cwd(), "public", "doctors-uploads")
    await mkdir(uploadsDir, { recursive: true })

    const filepath = path.join(uploadsDir, filename)
    const publicPath = `/doctors-uploads/${filename}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await sharp(buffer)
      .resize(800, 800, {
        fit: "cover",
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(filepath)

    await query(
      `UPDATE users SET picture = ? WHERE id = ?`,
      [publicPath, targetUserId]
    )

    const updatedUser = await query<Record<string, unknown>>(
      `SELECT id, usuario, email, full_name, first_name, last_name, picture,
              especialidad, cedula_profesional, direccion_consultorio,
              bio, instagram, linkedin, whatsapp, telefono, enlace_citas, google_maps,
              anos_experiencia, pacientes_atendidos, role, estado
       FROM users WHERE id = ?`,
      [targetUserId]
    )

    console.log(`✅ [UPLOAD] Imagen subida exitosamente: ${publicPath}`)

    return NextResponse.json({
      success: true,
      message: "Imagen subida correctamente",
      data: updatedUser[0],
      imageUrl: publicPath,
    })
  } catch (error) {
    console.error("[API doctor/upload-image] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al subir la imagen" },
      { status: 500 }
    )
  }
}
