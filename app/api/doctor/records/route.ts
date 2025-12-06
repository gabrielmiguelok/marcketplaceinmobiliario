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
  patient_nombre?: string
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
    const patientId = searchParams.get("patient_id")
    const estado = searchParams.get("estado") || "completado"
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let whereClause = "WHERE mr.doctor_id = ?"
    const params: any[] = [session.id]

    if (patientId) {
      whereClause += " AND mr.patient_id = ?"
      params.push(parseInt(patientId))
    }

    if (estado !== "todos") {
      whereClause += " AND mr.estado = ?"
      params.push(estado)
    }

    const records = await query<MedicalRecord & { patient_nombre: string }>(
      `SELECT
        mr.*,
        p.nombre_completo as patient_nombre
      FROM medical_records mr
      JOIN patients p ON p.id = mr.patient_id
      ${whereClause}
      ORDER BY mr.fecha_consulta DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM medical_records mr ${whereClause}`,
      params
    )

    return NextResponse.json({
      success: true,
      records,
      total: countResult[0]?.total || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("[API doctor/records GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener consultas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { patient_id } = body

    if (!patient_id) {
      return NextResponse.json({ success: false, error: "ID de paciente requerido" }, { status: 400 })
    }

    const patient = await query<{ id: number }>(
      `SELECT id FROM patients WHERE id = ? AND doctor_id = ?`,
      [patient_id, session.id]
    )

    if (!patient.length) {
      return NextResponse.json({ success: false, error: "Paciente no encontrado" }, { status: 404 })
    }

    const {
      fecha_consulta,
      tipo_consulta,
      motivo_consulta,
      sintomas,
      exploracion_fisica,
      diagnostico,
      tratamiento,
      receta,
      indicaciones,
      peso_kg,
      altura_cm,
      presion_arterial,
      frecuencia_cardiaca,
      temperatura,
      saturacion_oxigeno,
      estudios_solicitados,
      referencias,
      proxima_cita,
      notas_privadas,
      visible_paciente,
      estado,
    } = body

    const result = await query<{ insertId: number }>(
      `INSERT INTO medical_records (
        patient_id, doctor_id, fecha_consulta, tipo_consulta,
        motivo_consulta, sintomas, exploracion_fisica, diagnostico,
        tratamiento, receta, indicaciones, peso_kg, altura_cm,
        presion_arterial, frecuencia_cardiaca, temperatura,
        saturacion_oxigeno, estudios_solicitados, referencias,
        proxima_cita, notas_privadas, visible_paciente, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        session.id,
        fecha_consulta || new Date(),
        tipo_consulta || "seguimiento",
        motivo_consulta || null,
        sintomas || null,
        exploracion_fisica || null,
        diagnostico || null,
        tratamiento || null,
        receta || null,
        indicaciones || null,
        peso_kg || null,
        altura_cm || null,
        presion_arterial || null,
        frecuencia_cardiaca || null,
        temperatura || null,
        saturacion_oxigeno || null,
        estudios_solicitados || null,
        referencias || null,
        proxima_cita || null,
        notas_privadas || null,
        visible_paciente !== false,
        estado || "completado",
      ]
    )

    const insertId = (result as any).insertId

    const newRecord = await query<MedicalRecord>(
      `SELECT * FROM medical_records WHERE id = ?`,
      [insertId]
    )

    return NextResponse.json({
      success: true,
      message: "Consulta registrada correctamente",
      record: newRecord[0],
    })
  } catch (error) {
    console.error("[API doctor/records POST] Error:", error)
    return NextResponse.json({ success: false, error: "Error al crear consulta" }, { status: 500 })
  }
}
