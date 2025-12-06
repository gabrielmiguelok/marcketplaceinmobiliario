import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface FavoriteDoctor {
  id: number
  doctor_id: number
  full_name: string
  especialidad: string | null
  usuario: string | null
  picture: string | null
  direccion_consultorio: string | null
  whatsapp: string | null
  created_at: string
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const favorites = await query<FavoriteDoctor>(
      `SELECT
        pfd.id,
        pfd.doctor_id,
        u.full_name,
        u.especialidad,
        u.usuario,
        u.picture,
        u.direccion_consultorio,
        u.whatsapp,
        pfd.created_at
      FROM patient_favorite_doctors pfd
      JOIN users u ON u.id = pfd.doctor_id
      WHERE pfd.user_id = ?
      ORDER BY pfd.created_at DESC`,
      [session.id]
    )

    return NextResponse.json({
      success: true,
      favorites,
      total: favorites.length,
    })
  } catch (error) {
    console.error("[API paciente/favorites GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener favoritos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId } = body

    if (!doctorId) {
      return NextResponse.json({ success: false, error: "Se requiere doctorId" }, { status: 400 })
    }

    const doctor = await query<{ id: number; role: string }>(
      `SELECT id, role FROM users WHERE id = ? AND role = 'doctor' AND estado = 'confirmado'`,
      [doctorId]
    )

    if (doctor.length === 0) {
      return NextResponse.json({ success: false, error: "Doctor no encontrado" }, { status: 404 })
    }

    const existing = await query<{ id: number }>(
      `SELECT id FROM patient_favorite_doctors WHERE user_id = ? AND doctor_id = ?`,
      [session.id, doctorId]
    )

    if (existing.length > 0) {
      await query(
        `DELETE FROM patient_favorite_doctors WHERE user_id = ? AND doctor_id = ?`,
        [session.id, doctorId]
      )
      return NextResponse.json({
        success: true,
        action: "removed",
        message: "Doctor eliminado de favoritos",
      })
    }

    await query(
      `INSERT INTO patient_favorite_doctors (user_id, doctor_id) VALUES (?, ?)`,
      [session.id, doctorId]
    )

    return NextResponse.json({
      success: true,
      action: "added",
      message: "Doctor agregado a favoritos",
    })
  } catch (error) {
    console.error("[API paciente/favorites POST] Error:", error)
    return NextResponse.json({ success: false, error: "Error al modificar favoritos" }, { status: 500 })
  }
}
