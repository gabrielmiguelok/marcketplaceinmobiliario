import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const doctorId = session.id

    const [
      totalPacientesResult,
      consultasHoyResult,
      consultasMesResult,
      consultasTotalResult,
      ultimasConsultasResult,
      pacientesRecientesResult,
      consultasPorTipoResult,
      consultasPorMesResult,
    ] = await Promise.all([
      query<{ total: number }>(
        `SELECT COUNT(*) as total FROM patients WHERE doctor_id = ? AND estado = 'activo'`,
        [doctorId]
      ),
      query<{ total: number }>(
        `SELECT COUNT(*) as total FROM medical_records
         WHERE doctor_id = ? AND DATE(fecha_consulta) = CURDATE()`,
        [doctorId]
      ),
      query<{ total: number }>(
        `SELECT COUNT(*) as total FROM medical_records
         WHERE doctor_id = ? AND MONTH(fecha_consulta) = MONTH(CURDATE()) AND YEAR(fecha_consulta) = YEAR(CURDATE())`,
        [doctorId]
      ),
      query<{ total: number }>(
        `SELECT COUNT(*) as total FROM medical_records WHERE doctor_id = ?`,
        [doctorId]
      ),
      query<any[]>(
        `SELECT
          mr.id,
          mr.fecha_consulta,
          mr.tipo_consulta,
          mr.motivo_consulta,
          mr.diagnostico,
          p.id as patient_id,
          p.nombre_completo as paciente_nombre
        FROM medical_records mr
        JOIN patients p ON p.id = mr.patient_id
        WHERE mr.doctor_id = ?
        ORDER BY mr.fecha_consulta DESC
        LIMIT 5`,
        [doctorId]
      ),
      query<any[]>(
        `SELECT
          p.id,
          p.nombre_completo,
          p.telefono,
          p.email,
          p.tipo_sangre,
          p.created_at,
          COUNT(mr.id) as total_consultas,
          MAX(mr.fecha_consulta) as ultima_consulta
        FROM patients p
        LEFT JOIN medical_records mr ON mr.patient_id = p.id
        WHERE p.doctor_id = ? AND p.estado = 'activo'
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 5`,
        [doctorId]
      ),
      query<{ tipo: string; total: number }[]>(
        `SELECT tipo_consulta as tipo, COUNT(*) as total
         FROM medical_records
         WHERE doctor_id = ?
         GROUP BY tipo_consulta
         ORDER BY total DESC`,
        [doctorId]
      ),
      query<{ mes: string; total: number }[]>(
        `SELECT
          DATE_FORMAT(fecha_consulta, '%Y-%m') as mes,
          COUNT(*) as total
        FROM medical_records
        WHERE doctor_id = ? AND fecha_consulta >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(fecha_consulta, '%Y-%m')
        ORDER BY mes ASC`,
        [doctorId]
      ),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalPacientes: totalPacientesResult[0]?.total || 0,
        consultasHoy: consultasHoyResult[0]?.total || 0,
        consultasMes: consultasMesResult[0]?.total || 0,
        consultasTotal: consultasTotalResult[0]?.total || 0,
        solicitudesPendientes: 0,
      },
      ultimasConsultas: ultimasConsultasResult,
      pacientesRecientes: pacientesRecientesResult,
      consultasPorTipo: consultasPorTipoResult,
      consultasPorMes: consultasPorMesResult,
    })
  } catch (error) {
    console.error("[API doctor/dashboard] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener datos del dashboard" },
      { status: 500 }
    )
  }
}
