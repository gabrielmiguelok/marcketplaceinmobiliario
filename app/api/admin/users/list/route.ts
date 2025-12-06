import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    // Verificar si es admin
    if (session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const db = await getConnection()

    const [rows] = await db.query(
      `SELECT
        id,
        email,
        google_id,
        first_name,
        last_name,
        full_name,
        picture,
        locale,
        role,
        estado,
        telefono,
        especialidad,
        cedula_profesional,
        direccion_consultorio,
        fecha_nacimiento,
        created_at,
        updated_at,
        last_login
      FROM users
      ORDER BY created_at DESC`
    )

    return NextResponse.json({
      success: true,
      users: rows,
    })
  } catch (error: any) {
    console.error('[API admin/clientes/list] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al cargar clientes' },
      { status: 500 }
    )
  }
}
