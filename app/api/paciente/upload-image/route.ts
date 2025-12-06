import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import sharp from "sharp"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    if (session.role !== "paciente" && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

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

    const existingUser = await query<{ picture: string | null }>(
      `SELECT picture FROM users WHERE id = ?`,
      [session.id]
    )

    if (existingUser[0]?.picture && existingUser[0].picture.startsWith("/patients-uploads/")) {
      try {
        const oldImagePath = path.join(process.cwd(), "public", existingUser[0].picture)
        await unlink(oldImagePath)
        console.log(`📥 [UPLOAD PACIENTE] Imagen anterior eliminada: ${existingUser[0].picture}`)
      } catch {
      }
    }

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const filename = `paciente-${session.id}-${timestamp}-${randomStr}.webp`

    const uploadsDir = path.join(process.cwd(), "public", "patients-uploads")
    await mkdir(uploadsDir, { recursive: true })

    const filepath = path.join(uploadsDir, filename)
    const publicPath = `/patients-uploads/${filename}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(filepath)

    await query(
      `UPDATE users SET picture = ? WHERE id = ?`,
      [publicPath, session.id]
    )

    const updatedUser = await query<Record<string, unknown>>(
      `SELECT id, email, full_name, first_name, last_name, picture, telefono,
              direccion_consultorio as direccion, fecha_nacimiento, role, estado
       FROM users WHERE id = ?`,
      [session.id]
    )

    console.log(`✅ [UPLOAD PACIENTE] Imagen subida exitosamente: ${publicPath}`)

    return NextResponse.json({
      success: true,
      message: "Imagen subida correctamente",
      data: updatedUser[0],
      imageUrl: publicPath,
    })
  } catch (error) {
    console.error("[API paciente/upload-image] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al subir la imagen" },
      { status: 500 }
    )
  }
}
