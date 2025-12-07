import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import sharp from "sharp"
import { revalidatePath } from "next/cache"
import { getConnection } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const image = formData.get("image") as File
    const inmuebleId = formData.get("inmuebleId") as string

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó una imagen" },
        { status: 400 }
      )
    }

    if (!inmuebleId) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó el ID del inmueble" },
        { status: 400 }
      )
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WebP, GIF)." },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (image.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "La imagen es demasiado grande. Máximo 10MB." },
        { status: 400 }
      )
    }

    const db = await getConnection()
    const [existingInmueble]: any = await db.query(
      "SELECT id, imagen_url FROM inmuebles WHERE id = ?",
      [inmuebleId]
    )

    if (existingInmueble.length === 0) {
      return NextResponse.json(
        { success: false, error: "Inmueble no encontrado" },
        { status: 404 }
      )
    }

    const oldImageUrl = existingInmueble[0].imagen_url
    if (oldImageUrl) {
      try {
        const oldImagePath = path.join(process.cwd(), "public", oldImageUrl)
        await unlink(oldImagePath)
        console.log(`📥 [UPLOAD] Imagen anterior eliminada: ${oldImageUrl}`)

        const oldFilename = path.basename(oldImageUrl)
        const oldThumbPath = path.join(process.cwd(), "public", "inmuebles", `thumb-${oldFilename}`)
        await unlink(oldThumbPath).catch(() => {})
      } catch {
      }
    }

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const baseFilename = `inmueble-${inmuebleId}-${timestamp}-${randomStr}`
    const filename = `${baseFilename}.webp`
    const thumbFilename = `thumb-${baseFilename}.webp`

    const publicDir = path.join(process.cwd(), "public", "inmuebles")
    await mkdir(publicDir, { recursive: true })

    const imagePath = path.join(publicDir, filename)
    const thumbPath = path.join(publicDir, thumbFilename)
    const imageUrl = `/inmuebles/${filename}`

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await Promise.all([
      sharp(buffer)
        .resize(800, 600, {
          fit: "cover",
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(imagePath),
      sharp(buffer)
        .resize(100, 100, {
          fit: "cover",
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(thumbPath)
    ])

    console.log(`📸 [UPLOAD] Thumbnail creado: /inmuebles/${thumbFilename}`)

    await db.query(
      "UPDATE inmuebles SET imagen_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [imageUrl, inmuebleId]
    )

    const [updatedInmueble]: any = await db.query(
      'SELECT * FROM inmuebles WHERE id = ?',
      [inmuebleId]
    )

    console.log(`✅ [UPLOAD] Imagen subida exitosamente: ${imageUrl}`)

    revalidatePath('/inmuebles')

    return NextResponse.json({
      success: true,
      data: updatedInmueble[0],
      imageUrl,
      message: "Imagen subida exitosamente"
    })

  } catch (error: any) {
    console.error("❌ [UPLOAD] Error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
