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
  paciente_nombre?: string
  paciente_email?: string
  paciente_picture?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado") || "pendiente"

    let whereClause = "WHERE lr.doctor_id = ?"
    const params: any[] = [session.id]

    if (estado !== "todos") {
      whereClause += " AND lr.estado = ?"
      params.push(estado)
    }

    const requests = await query<LinkRequest>(
      `SELECT
        lr.*,
        u.full_name as paciente_nombre,
        u.email as paciente_email,
        u.picture as paciente_picture
      FROM patient_link_requests lr
      JOIN users u ON u.id = lr.user_id
      ${whereClause}
      ORDER BY lr.created_at DESC`,
      params
    )

    return NextResponse.json({
      success: true,
      requests,
    })
  } catch (error) {
    console.error("[API doctor/link-requests GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener solicitudes" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { request_id, action, respuesta } = body

    if (!request_id || !action) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    if (!["aprobar", "rechazar"].includes(action)) {
      return NextResponse.json({ success: false, error: "Acción inválida" }, { status: 400 })
    }

    const linkRequest = await query<{ id: number; user_id: number }>(
      `SELECT id, user_id FROM patient_link_requests WHERE id = ? AND doctor_id = ? AND estado = 'pendiente'`,
      [request_id, session.id]
    )

    if (!linkRequest.length) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada" }, { status: 404 })
    }

    const newEstado = action === "aprobar" ? "aprobado" : "rechazado"

    await query(
      `UPDATE patient_link_requests
       SET estado = ?, respuesta = ?, respondido_at = NOW()
       WHERE id = ?`,
      [newEstado, respuesta || null, request_id]
    )

    if (action === "aprobar") {
      const user = await query<{ full_name: string; email: string; telefono: string }>(
        `SELECT full_name, email, telefono FROM users WHERE id = ?`,
        [linkRequest[0].user_id]
      )

      if (user.length) {
        const existingPatient = await query<{ id: number }>(
          `SELECT id FROM patients WHERE doctor_id = ? AND user_id = ?`,
          [session.id, linkRequest[0].user_id]
        )

        if (!existingPatient.length) {
          await query(
            `INSERT INTO patients (doctor_id, user_id, nombre_completo, email, telefono)
             VALUES (?, ?, ?, ?, ?)`,
            [
              session.id,
              linkRequest[0].user_id,
              user[0].full_name || "Paciente",
              user[0].email,
              user[0].telefono || null,
            ]
          )
        } else {
          await query(
            `UPDATE patients SET user_id = ? WHERE id = ?`,
            [linkRequest[0].user_id, existingPatient[0].id]
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: action === "aprobar"
        ? "Solicitud aprobada. El paciente ha sido vinculado."
        : "Solicitud rechazada.",
    })
  } catch (error) {
    console.error("[API doctor/link-requests PUT] Error:", error)
    return NextResponse.json({ success: false, error: "Error al procesar solicitud" }, { status: 500 })
  }
}
