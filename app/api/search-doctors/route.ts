import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = 'force-dynamic'

interface DoctorResult {
  id: number
  usuario: string
  full_name: string
  first_name: string | null
  last_name: string | null
  picture: string | null
  especialidad: string | null
  direccion_consultorio: string | null
  anos_experiencia: number | null
  pacientes_atendidos: number | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get("query")?.trim() || ""
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50)

    if (!searchQuery) {
      const doctors = await query<DoctorResult>(
        `SELECT id, usuario, full_name, first_name, last_name, picture,
                especialidad, direccion_consultorio, anos_experiencia, pacientes_atendidos
         FROM users
         WHERE role = 'doctor' AND estado = 'confirmado' AND usuario IS NOT NULL
         ORDER BY pacientes_atendidos DESC, anos_experiencia DESC
         LIMIT ?`,
        [limit]
      )

      return NextResponse.json({ success: true, doctors, total: doctors.length })
    }

    const searchTerm = `%${searchQuery}%`

    const doctors = await query<DoctorResult>(
      `SELECT id, usuario, full_name, first_name, last_name, picture,
              especialidad, direccion_consultorio, anos_experiencia, pacientes_atendidos
       FROM users
       WHERE role = 'doctor' AND estado = 'confirmado' AND usuario IS NOT NULL
         AND (
           full_name LIKE ? OR
           first_name LIKE ? OR
           last_name LIKE ? OR
           especialidad LIKE ? OR
           direccion_consultorio LIKE ? OR
           bio LIKE ?
         )
       ORDER BY
         CASE
           WHEN especialidad LIKE ? THEN 1
           WHEN full_name LIKE ? THEN 2
           ELSE 3
         END,
         pacientes_atendidos DESC
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]
    )

    return NextResponse.json({ success: true, doctors, total: doctors.length })
  } catch (error) {
    console.error("[API search-doctors] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al buscar médicos" },
      { status: 500 }
    )
  }
}
