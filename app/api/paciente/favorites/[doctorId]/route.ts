import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, isFavorite: false }, { status: 401 })
    }

    const { doctorId } = await params

    const favorite = await query<{ id: number }>(
      `SELECT id FROM patient_favorite_doctors WHERE user_id = ? AND doctor_id = ?`,
      [session.id, parseInt(doctorId)]
    )

    return NextResponse.json({
      success: true,
      isFavorite: favorite.length > 0,
    })
  } catch (error) {
    console.error("[API paciente/favorites/[doctorId] GET] Error:", error)
    return NextResponse.json({ success: false, isFavorite: false }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const { doctorId } = await params

    await query(
      `DELETE FROM patient_favorite_doctors WHERE user_id = ? AND doctor_id = ?`,
      [session.id, parseInt(doctorId)]
    )

    return NextResponse.json({
      success: true,
      message: "Doctor eliminado de favoritos",
    })
  } catch (error) {
    console.error("[API paciente/favorites/[doctorId] DELETE] Error:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar favorito" }, { status: 500 })
  }
}
