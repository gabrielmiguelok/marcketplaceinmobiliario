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
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const db = await getConnection()

    let baseWhere = "estado = 'disponible'"
    const params: any[] = []

    if (query) {
      baseWhere += ` AND (
        titulo LIKE ? OR
        descripcion LIKE ? OR
        ubicacion LIKE ? OR
        zona LIKE ?
      )`
      const searchTerm = `%${query}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (zona) {
      baseWhere += ` AND zona = ?`
      params.push(zona)
    }

    if (tipo) {
      baseWhere += ` AND tipo = ?`
      params.push(tipo)
    }

    if (operacion) {
      baseWhere += ` AND operacion = ?`
      params.push(operacion)
    }

    if (habitaciones) {
      const habNum = parseInt(habitaciones)
      if (habNum === 0) {
        baseWhere += ` AND (habitaciones = 0 OR habitaciones IS NULL)`
      } else if (habNum >= 4) {
        baseWhere += ` AND habitaciones >= 4`
      } else {
        baseWhere += ` AND habitaciones = ?`
        params.push(habNum)
      }
    }

    if (precioMin) {
      baseWhere += ` AND precio >= ?`
      params.push(parseFloat(precioMin))
    }

    if (precioMax) {
      baseWhere += ` AND precio <= ?`
      params.push(parseFloat(precioMax))
    }

    const [countResult]: any = await db.query(
      `SELECT COUNT(*) as total FROM inmuebles WHERE ${baseWhere}`,
      params
    )
    const totalFiltered = countResult[0]?.total || 0

    let sql = `
      SELECT id, titulo, descripcion, tipo, operacion, precio, moneda,
             ubicacion, zona, departamento, metros_cuadrados, habitaciones,
             banos, parqueos, imagen_url, destacado, estado, latitud, longitud
      FROM inmuebles
      WHERE ${baseWhere}
      ORDER BY
        CASE WHEN destacado = 1 THEN 0 ELSE 1 END,
        ${query ? `
        CASE
          WHEN titulo LIKE ? THEN 1
          WHEN zona = ? THEN 2
          ELSE 3
        END,
        ` : ''}
        created_at DESC
      LIMIT ? OFFSET ?
    `

    const queryParams = [...params]
    if (query) {
      queryParams.push(`%${query}%`, query)
    }
    queryParams.push(limit, offset)

    const [rows] = await db.query(sql, queryParams)

    return NextResponse.json({
      success: true,
      inmuebles: rows,
      total: totalFiltered,
      limit,
      offset,
      hasMore: offset + (rows as any[]).length < totalFiltered
    })
  } catch (error) {
    console.error("Error en búsqueda:", error)
    return NextResponse.json(
      { success: false, error: "Error en la búsqueda" },
      { status: 500 }
    )
  }
}
