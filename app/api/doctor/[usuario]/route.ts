import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface DoctorProfile {
  id: number
  usuario: string
  full_name: string
  first_name: string
  last_name: string
  picture: string | null
  especialidad: string | null
  cedula_profesional: string | null
  direccion_consultorio: string | null
  bio: string | null
  instagram: string | null
  linkedin: string | null
  youtube: string | null
  tiktok: string | null
  facebook: string | null
  twitter: string | null
  whatsapp: string | null
  telefono: string | null
  enlace_citas: string | null
  google_maps: string | null
  anos_experiencia: number | null
  pacientes_atendidos: number | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ usuario: string }> }
) {
  try {
    const { usuario } = await params

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no especificado' },
        { status: 400 }
      )
    }

    const rows = await query<DoctorProfile>(
      `SELECT
        id,
        usuario,
        full_name,
        first_name,
        last_name,
        picture,
        especialidad,
        cedula_profesional,
        direccion_consultorio,
        bio,
        instagram,
        linkedin,
        youtube,
        tiktok,
        facebook,
        twitter,
        whatsapp,
        telefono,
        enlace_citas,
        google_maps,
        anos_experiencia,
        pacientes_atendidos
      FROM users
      WHERE usuario = ?
        AND role = 'doctor'
        AND estado = 'confirmado'
      LIMIT 1`,
      [usuario]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      doctor: rows[0]
    })
  } catch (error: any) {
    console.error('[API doctor/usuario] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al cargar perfil' },
      { status: 500 }
    )
  }
}
