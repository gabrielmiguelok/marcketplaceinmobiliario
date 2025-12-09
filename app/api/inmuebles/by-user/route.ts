import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuario = searchParams.get('usuario')

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario es requerido' },
        { status: 400 }
      )
    }

    const db = await getConnection()

    const [users]: any = await db.query(
      `SELECT id, usuario, email, full_name, first_name, last_name, picture
       FROM users
       WHERE usuario = ? AND estado = 'confirmado'
       LIMIT 1`,
      [usuario]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = users[0]

    const [inmuebles]: any = await db.query(
      `SELECT * FROM inmuebles
       WHERE user_id = ? AND estado = 'disponible'
       ORDER BY destacado DESC, created_at DESC`,
      [user.id]
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        usuario: user.usuario,
        email: user.email,
        full_name: user.full_name,
        first_name: user.first_name,
        picture: user.picture
      },
      inmuebles,
      total: inmuebles.length
    })
  } catch (error: any) {
    console.error('Error fetching inmuebles by user:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
