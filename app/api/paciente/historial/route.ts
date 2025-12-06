import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface MedicalRecordForPatient {
  id: number
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
  proxima_cita: Date | null
  doctor_nombre: string
  doctor_especialidad: string | null
  doctor_usuario: string | null
  doctor_picture: string | null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "paciente" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctor_id")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let whereClause = `
      WHERE p.user_id = ?
        AND mr.visible_paciente = TRUE
        AND mr.estado = 'completado'
    `
    const params: any[] = [session.id]

    if (doctorId) {
      whereClause += " AND mr.doctor_id = ?"
      params.push(parseInt(doctorId))
    }

    const records = await query<MedicalRecordForPatient>(
      `SELECT
        mr.id,
        mr.fecha_consulta,
        mr.tipo_consulta,
        mr.motivo_consulta,
        mr.sintomas,
        mr.exploracion_fisica,
        mr.diagnostico,
        mr.tratamiento,
        mr.receta,
        mr.indicaciones,
        mr.peso_kg,
        mr.altura_cm,
        mr.presion_arterial,
        mr.frecuencia_cardiaca,
        mr.temperatura,
        mr.saturacion_oxigeno,
        mr.proxima_cita,
        u.full_name as doctor_nombre,
        u.especialidad as doctor_especialidad,
        u.usuario as doctor_usuario,
        u.picture as doctor_picture
      FROM medical_records mr
      JOIN patients p ON p.id = mr.patient_id
      JOIN users u ON u.id = mr.doctor_id
      ${whereClause}
      ORDER BY mr.fecha_consulta DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM medical_records mr
       JOIN patients p ON p.id = mr.patient_id
       ${whereClause}`,
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
    console.error("[API paciente/historial GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener historial" }, { status: 500 })
  }
}
