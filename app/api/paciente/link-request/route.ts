import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface LinkRequest {
  id: number
  user_id: number
  doctor_id: number
  mensaje: string | null
  estado: string
  respuesta: string | null
  respondido_at: Date | null
  created_at: Date
  doctor_nombre?: string
  doctor_especialidad?: string
  doctor_usuario?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "paciente") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const requests = await query<LinkRequest>(
      `SELECT
        lr.*,
        u.full_name as doctor_nombre,
        u.especialidad as doctor_especialidad,
        u.usuario as doctor_usuario
      FROM patient_link_requests lr
      JOIN users u ON u.id = lr.doctor_id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC`,
      [session.id]
    )

    return NextResponse.json({
      success: true,
      requests,
    })
  } catch (error) {
    console.error("[API paciente/link-request GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener solicitudes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "paciente") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { doctor_id, mensaje } = body

    if (!doctor_id) {
      return NextResponse.json({ success: false, error: "ID de doctor requerido" }, { status: 400 })
    }

    const doctor = await query<{ id: number }>(
      `SELECT id FROM users WHERE id = ? AND role = 'doctor' AND estado = 'confirmado'`,
      [doctor_id]
    )

    if (!doctor.length) {
      return NextResponse.json({ success: false, error: "Doctor no encontrado" }, { status: 404 })
    }

    const existing = await query<{ id: number }>(
      `SELECT id FROM patient_link_requests WHERE user_id = ? AND doctor_id = ?`,
      [session.id, doctor_id]
    )

    if (existing.length) {
      return NextResponse.json(
        { success: false, error: "Ya existe una solicitud para este doctor", code: "REQUEST_EXISTS" },
        { status: 409 }
      )
    }

    await query(
      `INSERT INTO patient_link_requests (user_id, doctor_id, mensaje) VALUES (?, ?, ?)`,
      [session.id, doctor_id, mensaje || null]
    )

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada correctamente",
    })
  } catch (error) {
    console.error("[API paciente/link-request POST] Error:", error)
    return NextResponse.json({ success: false, error: "Error al enviar solicitud" }, { status: 500 })
  }
}
