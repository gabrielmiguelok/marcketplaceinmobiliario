import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
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

    const { userId, field, value } = await request.json()

    if (!userId || !field) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Validar que el campo sea permitido para edición
    const allowedFields = [
      'first_name',
      'last_name',
      'full_name',
      'locale',
      'role',
      'estado',
    ]

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo '${field}' no permitido para edición` },
        { status: 400 }
      )
    }

    const db = await getConnection()

    await db.query(
      `UPDATE users SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [value, userId]
    )

    // Obtener el usuario actualizado
    const [rows] = await db.query(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    )

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        field,
        value,
        user: rows[0],
      },
    })
  } catch (error: any) {
    console.error('[API admin/users/update-field] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar campo' },
      { status: 500 }
    )
  }
}
