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
  total_consultas?: number
  ultima_consulta?: Date | null
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

    if (session.estado !== "confirmado") {
      return NextResponse.json({ success: false, error: "Cuenta pendiente de aprobación" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const estado = searchParams.get("estado") || "activo"
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let whereClause = "WHERE p.doctor_id = ? AND p.estado = ?"
    const params: any[] = [session.id, estado]

    if (search) {
      whereClause += " AND (p.nombre_completo LIKE ? OR p.email LIKE ? OR p.telefono LIKE ?)"
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    const patients = await query<Patient & { total_consultas: number; ultima_consulta: Date | null }>(
      `SELECT
        p.*,
        COUNT(mr.id) as total_consultas,
        MAX(mr.fecha_consulta) as ultima_consulta
      FROM patients p
      LEFT JOIN medical_records mr ON mr.patient_id = p.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.updated_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM patients p ${whereClause}`,
      params
    )

    return NextResponse.json({
      success: true,
      patients,
      total: countResult[0]?.total || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("[API doctor/patients GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener pacientes" }, { status: 500 })
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

    if (session.estado !== "confirmado") {
      return NextResponse.json({ success: false, error: "Cuenta pendiente de aprobación" }, { status: 403 })
    }

    const body = await request.json()
    const {
      nombre_completo,
      email,
      telefono,
      whatsapp,
      fecha_nacimiento,
      sexo,
      tipo_sangre,
      alergias,
      antecedentes_familiares,
      antecedentes_personales,
      medicamentos_actuales,
      notas_privadas,
    } = body

    if (!nombre_completo || nombre_completo.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "El nombre del paciente es requerido" },
        { status: 400 }
      )
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO patients (
        doctor_id, nombre_completo, email, telefono, whatsapp,
        fecha_nacimiento, sexo, tipo_sangre, alergias,
        antecedentes_familiares, antecedentes_personales,
        medicamentos_actuales, notas_privadas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        nombre_completo.trim(),
        email || null,
        telefono || null,
        whatsapp || null,
        fecha_nacimiento || null,
        sexo || "no_especificado",
        tipo_sangre || "desconocido",
        alergias || null,
        antecedentes_familiares || null,
        antecedentes_personales || null,
        medicamentos_actuales || null,
        notas_privadas || null,
      ]
    )

    const insertId = (result as any).insertId

    const newPatient = await query<Patient>(
      `SELECT * FROM patients WHERE id = ?`,
      [insertId]
    )

    return NextResponse.json({
      success: true,
      message: "Paciente creado correctamente",
      patient: newPatient[0],
    })
  } catch (error) {
    console.error("[API doctor/patients POST] Error:", error)
    return NextResponse.json({ success: false, error: "Error al crear paciente" }, { status: 500 })
  }
}
