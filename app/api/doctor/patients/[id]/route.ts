import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface Patient {
  id: number
  doctor_id: number
  user_id: number | null
  nombre_completo: string
  email: string | null
  telefono: string | null
  whatsapp: string | null
  fecha_nacimiento: Date | null
  sexo: string
  tipo_sangre: string
  alergias: string | null
  antecedentes_familiares: string | null
  antecedentes_personales: string | null
  medicamentos_actuales: string | null
  notas_privadas: string | null
  estado: string
  created_at: Date
  updated_at: Date
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const patientId = parseInt(id)

    if (isNaN(patientId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 })
    }

    const patients = await query<Patient>(
      `SELECT * FROM patients WHERE id = ? AND doctor_id = ?`,
      [patientId, session.id]
    )

    if (!patients.length) {
      return NextResponse.json({ success: false, error: "Paciente no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      patient: patients[0],
    })
  } catch (error) {
    console.error("[API doctor/patients/[id] GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener paciente" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const patientId = parseInt(id)

    if (isNaN(patientId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 })
    }

    const existing = await query<Patient>(
      `SELECT id FROM patients WHERE id = ? AND doctor_id = ?`,
      [patientId, session.id]
    )

    if (!existing.length) {
      return NextResponse.json({ success: false, error: "Paciente no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const allowedFields = [
      "nombre_completo",
      "email",
      "telefono",
      "whatsapp",
      "fecha_nacimiento",
      "sexo",
      "tipo_sangre",
      "alergias",
      "antecedentes_familiares",
      "antecedentes_personales",
      "medicamentos_actuales",
      "notas_privadas",
      "estado",
    ]

    const updates: string[] = []
    const values: any[] = []

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`)
        values.push(body[field] === "" ? null : body[field])
      }
    }

    if (!updates.length) {
      return NextResponse.json({ success: false, error: "No hay campos para actualizar" }, { status: 400 })
    }

    values.push(patientId, session.id)

    await query(
      `UPDATE patients SET ${updates.join(", ")} WHERE id = ? AND doctor_id = ?`,
      values
    )

    const updated = await query<Patient>(
      `SELECT * FROM patients WHERE id = ?`,
      [patientId]
    )

    // Sincronizar con users si el paciente tiene user_id vinculado
    if (updated[0]?.user_id) {
      const syncFields: Record<string, string> = {
        fecha_nacimiento: "fecha_nacimiento",
        telefono: "telefono",
        tipo_sangre: "tipo_sangre",
        alergias: "alergias",
        antecedentes_familiares: "antecedentes_familiares",
        antecedentes_personales: "antecedentes_personales",
        medicamentos_actuales: "medicamentos_actuales",
        sexo: "sexo",
      }

      const syncUpdates: string[] = []
      const syncValues: any[] = []

      for (const [patientField, userField] of Object.entries(syncFields)) {
        if (body[patientField] !== undefined) {
          syncUpdates.push(`${userField} = ?`)
          syncValues.push(body[patientField] === "" ? null : body[patientField])
        }
      }

      if (syncUpdates.length > 0) {
        syncValues.push(updated[0].user_id)
        await query(
          `UPDATE users SET ${syncUpdates.join(", ")} WHERE id = ?`,
          syncValues
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Paciente actualizado correctamente",
      patient: updated[0],
    })
  } catch (error) {
    console.error("[API doctor/patients/[id] PUT] Error:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar paciente" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const patientId = parseInt(id)

    if (isNaN(patientId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 })
    }

    await query(
      `UPDATE patients SET estado = 'archivado' WHERE id = ? AND doctor_id = ?`,
      [patientId, session.id]
    )

    return NextResponse.json({
      success: true,
      message: "Paciente archivado correctamente",
    })
  } catch (error) {
    console.error("[API doctor/patients/[id] DELETE] Error:", error)
    return NextResponse.json({ success: false, error: "Error al archivar paciente" }, { status: 500 })
  }
}
