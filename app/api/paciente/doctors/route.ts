import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface DoctorForPatient {
  id: number
  full_name: string
  especialidad: string | null
  usuario: string | null
  picture: string | null
  telefono: string | null
  whatsapp: string | null
  direccion_consultorio: string | null
  total_consultas: number
  ultima_consulta: Date | null
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

    const doctors = await query<DoctorForPatient>(
      `SELECT
        u.id,
        u.full_name,
        u.especialidad,
        u.usuario,
        u.picture,
        u.telefono,
        u.whatsapp,
        u.direccion_consultorio,
        COUNT(mr.id) as total_consultas,
        MAX(mr.fecha_consulta) as ultima_consulta
      FROM users u
      JOIN patients p ON p.doctor_id = u.id AND p.user_id = ?
      LEFT JOIN medical_records mr ON mr.patient_id = p.id AND mr.visible_paciente = TRUE
      WHERE u.role = 'doctor' AND u.estado = 'confirmado'
      GROUP BY u.id
      ORDER BY ultima_consulta DESC`,
      [session.id]
    )

    return NextResponse.json({
      success: true,
      doctors,
      total: doctors.length,
    })
  } catch (error) {
    console.error("[API paciente/doctors GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener doctores" }, { status: 500 })
  }
}
