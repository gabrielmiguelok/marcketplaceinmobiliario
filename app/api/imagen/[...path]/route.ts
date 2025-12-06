import { NextRequest, NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params
    const imagePath = pathParts.join("/")

    const fullPath = path.join(process.cwd(), "public", imagePath)

    try {
      await stat(fullPath)
    } catch {
      return new NextResponse("Imagen no encontrada", { status: 404 })
    }

    const imageBuffer = await readFile(fullPath)

    const ext = path.extname(fullPath).toLowerCase()
    const contentTypes: Record<string, string> = {
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    }
    const contentType = contentTypes[ext] || "application/octet-stream"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("❌ [IMAGEN API] Error:", error)
    return new NextResponse("Error interno", { status: 500 })
  }
}
