import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  fecha_consulta: Date
  tipo_consulta: string
  motivo_consulta: string | null
  sintomas: string | null
  exploracion_fisica: string | null
  diagnostico: string | null
  tratamiento: string | null
  receta: string | null
  indicaciones: string | null
  peso_kg: number | null
  altura_cm: number | null
  presion_arterial: string | null
  frecuencia_cardiaca: number | null
  temperatura: number | null
  saturacion_oxigeno: number | null
  estudios_solicitados: string | null
  referencias: string | null
  proxima_cita: Date | null
  notas_privadas: string | null
  visible_paciente: boolean
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
    const recordId = parseInt(id)

    if (isNaN(recordId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 })
    }

    const records = await query<MedicalRecord & { patient_nombre: string }>(
      `SELECT mr.*, p.nombre_completo as patient_nombre
       FROM medical_records mr
       JOIN patients p ON p.id = mr.patient_id
       WHERE mr.id = ? AND mr.doctor_id = ?`,
      [recordId, session.id]
    )

    if (!records.length) {
      return NextResponse.json({ success: false, error: "Consulta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      record: records[0],
    })
  } catch (error) {
    console.error("[API doctor/records/[id] GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener consulta" }, { status: 500 })
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
    const recordId = parseInt(id)

    if (isNaN(recordId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 })
    }

    const existing = await query<MedicalRecord>(
      `SELECT id FROM medical_records WHERE id = ? AND doctor_id = ?`,
      [recordId, session.id]
    )

    if (!existing.length) {
      return NextResponse.json({ success: false, error: "Consulta no encontrada" }, { status: 404 })
    }

    const body = await request.json()
    const allowedFields = [
      "fecha_consulta",
      "tipo_consulta",
      "motivo_consulta",
      "sintomas",
      "exploracion_fisica",
      "diagnostico",
      "tratamiento",
      "receta",
      "indicaciones",
      "peso_kg",
      "altura_cm",
      "presion_arterial",
      "frecuencia_cardiaca",
      "temperatura",
      "saturacion_oxigeno",
      "estudios_solicitados",
      "referencias",
      "proxima_cita",
      "notas_privadas",
      "visible_paciente",
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

    values.push(recordId, session.id)

    await query(
      `UPDATE medical_records SET ${updates.join(", ")} WHERE id = ? AND doctor_id = ?`,
      values
    )

    const updated = await query<MedicalRecord>(
      `SELECT * FROM medical_records WHERE id = ?`,
      [recordId]
    )

    return NextResponse.json({
      success: true,
      message: "Consulta actualizada correctamente",
      record: updated[0],
    })
  } catch (error) {
    console.error("[API doctor/records/[id] PUT] Error:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar consulta" }, { status: 500 })
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
    const recordId = parseInt(id)

    if (isNaN(recordId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 })
    }

    await query(
      `UPDATE medical_records SET estado = 'archivado' WHERE id = ? AND doctor_id = ?`,
      [recordId, session.id]
    )

    return NextResponse.json({
      success: true,
      message: "Consulta archivada correctamente",
    })
  } catch (error) {
    console.error("[API doctor/records/[id] DELETE] Error:", error)
    return NextResponse.json({ success: false, error: "Error al archivar consulta" }, { status: 500 })
  }
}
