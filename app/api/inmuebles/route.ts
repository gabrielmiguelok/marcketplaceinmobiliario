import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getConnection } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getConnection()
    const [rows] = await db.query(`
      SELECT * FROM inmuebles
      ORDER BY destacado DESC, created_at DESC
    `)

    return NextResponse.json(rows, { status: 200 })
  } catch (error: any) {
    console.error('Error al obtener inmuebles:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      titulo,
      descripcion = '',
      tipo = 'apartamento',
      operacion = 'venta',
      precio,
      moneda = 'USD',
      ubicacion = '',
      zona = '',
      departamento = 'Guatemala',
      metros_cuadrados = 0,
      habitaciones = 0,
      banos = 0,
      parqueos = 0,
      destacado = false,
      estado = 'disponible',
      latitud = null,
      longitud = null
    } = body

    if (!titulo || titulo.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El título es requerido' },
        { status: 400 }
      )
    }

    if (!precio || precio <= 0) {
      return NextResponse.json(
        { success: false, error: 'El precio es requerido y debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const db = await getConnection()
    const [result]: any = await db.query(
      `INSERT INTO inmuebles (titulo, descripcion, tipo, operacion, precio, moneda, ubicacion, zona, departamento, metros_cuadrados, habitaciones, banos, parqueos, destacado, estado, latitud, longitud)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion, tipo, operacion, precio, moneda, ubicacion, zona, departamento, metros_cuadrados, habitaciones, banos, parqueos, destacado, estado, latitud, longitud]
    )

    const [rows] = await db.query('SELECT * FROM inmuebles WHERE id = ?', [result.insertId])

    revalidatePath('/inmuebles')

    return NextResponse.json(
      { success: true, data: (rows as any[])[0] },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al crear inmueble:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { id, field, value } = body

    if (!id || !field) {
      return NextResponse.json(
        { success: false, error: 'ID y campo son requeridos' },
        { status: 400 }
      )
    }

    const allowedFields = [
      'titulo', 'descripcion', 'tipo', 'operacion', 'precio', 'moneda',
      'ubicacion', 'zona', 'departamento', 'metros_cuadrados',
      'habitaciones', 'banos', 'parqueos', 'destacado', 'estado', 'imagen_url',
      'latitud', 'longitud'
    ]

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo '${field}' no permitido` },
        { status: 400 }
      )
    }

    const db = await getConnection()
    const [result]: any = await db.query(
      `UPDATE inmuebles SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [value, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Inmueble no encontrado' },
        { status: 404 }
      )
    }

    const [rows] = await db.query('SELECT * FROM inmuebles WHERE id = ?', [id])

    revalidatePath('/inmuebles')

    return NextResponse.json(
      { success: true, data: (rows as any[])[0] },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error al actualizar inmueble:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const db = await getConnection()
    const [result]: any = await db.query('DELETE FROM inmuebles WHERE id = ?', [id])

    revalidatePath('/inmuebles')

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error al eliminar inmueble:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
