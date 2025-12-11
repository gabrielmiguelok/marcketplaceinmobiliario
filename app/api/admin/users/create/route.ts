import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const { email, full_name, first_name, last_name, role, estado } = await request.json()

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'El email es obligatorio' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'El email no es válido' },
        { status: 400 }
      )
    }

    const db = await getConnection()

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    )

    if (existing && (existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con ese email' },
        { status: 409 }
      )
    }

    const [result] = await db.query(
      `INSERT INTO users (email, full_name, first_name, last_name, role, estado, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        email.toLowerCase().trim(),
        full_name || null,
        first_name || null,
        last_name || null,
        role || 'user',
        estado || 'pendiente',
      ]
    )

    const insertId = (result as any).insertId

    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [insertId]
    )

    return NextResponse.json({
      success: true,
      data: (rows as any[])[0],
    })
  } catch (error: any) {
    console.error('[API admin/users/create] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
