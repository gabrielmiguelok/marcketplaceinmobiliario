import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get("q") || ""
    const zona = searchParams.get("zona") || ""
    const tipo = searchParams.get("tipo") || ""
    const operacion = searchParams.get("operacion") || ""
    const habitaciones = searchParams.get("habitaciones") || ""
    const precioMin = searchParams.get("precio_min") || ""
    const precioMax = searchParams.get("precio_max") || ""
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)

    const db = await getConnection()

    let sql = `
      SELECT id, titulo, descripcion, tipo, operacion, precio, moneda,
             ubicacion, zona, departamento, metros_cuadrados, habitaciones,
             banos, parqueos, imagen_url, destacado, estado, latitud, longitud
      FROM inmuebles
      WHERE estado = 'disponible'
    `
    const params: any[] = []

    if (query) {
      sql += ` AND (
        titulo LIKE ? OR
        descripcion LIKE ? OR
        ubicacion LIKE ? OR
        zona LIKE ?
      )`
      const searchTerm = `%${query}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (zona) {
      sql += ` AND zona = ?`
      params.push(zona)
    }

    if (tipo) {
      sql += ` AND tipo = ?`
      params.push(tipo)
    }

    if (operacion) {
      sql += ` AND operacion = ?`
      params.push(operacion)
    }

    if (habitaciones) {
      const habNum = parseInt(habitaciones)
      if (habNum >= 4) {
        sql += ` AND habitaciones >= 4`
      } else {
        sql += ` AND habitaciones = ?`
        params.push(habNum)
      }
    }

    if (precioMin) {
      sql += ` AND precio >= ?`
      params.push(parseFloat(precioMin))
    }

    if (precioMax) {
      sql += ` AND precio <= ?`
      params.push(parseFloat(precioMax))
    }

    sql += ` ORDER BY
      CASE WHEN destacado = 1 THEN 0 ELSE 1 END,
      ${query ? `
      CASE
        WHEN titulo LIKE ? THEN 1
        WHEN zona = ? THEN 2
        ELSE 3
      END,
      ` : ''}
      created_at DESC
      LIMIT ?
    `

    if (query) {
      params.push(`%${query}%`, query)
    }
    params.push(limit)

    const [rows] = await db.query(sql, params)

    const [countResult]: any = await db.query(
      `SELECT COUNT(*) as total FROM inmuebles WHERE estado = 'disponible'`
    )

    return NextResponse.json({
      success: true,
      inmuebles: rows,
      total: (rows as any[]).length,
      totalDisponibles: countResult[0]?.total || 0
    })
  } catch (error) {
    console.error("Error en búsqueda:", error)
    return NextResponse.json(
      { success: false, error: "Error en la búsqueda" },
      { status: 500 }
    )
  }
}
