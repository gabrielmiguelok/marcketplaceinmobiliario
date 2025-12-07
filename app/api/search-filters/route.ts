import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export const dynamic = 'force-dynamic'

const zonaLabels: Record<string, string> = {
  "1": "Centro Histórico",
  "4": "Centro Cívico",
  "5": "Kaminal Juyú",
  "6": "El Progreso",
  "7": "Tikal Futura",
  "8": "San Juan",
  "9": "Parque de la Industria",
  "10": "Zona Viva, Oakland",
  "11": "Mariscal, Roosevelt",
  "12": "Reformita",
  "13": "Aurora",
  "14": "La Villa, Las Américas",
  "15": "Vista Hermosa",
  "16": "Acatán",
  "17": "San José Las Rosas",
  "18": "Santa Elena",
}

const tipoLabels: Record<string, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  terreno: "Terreno",
  oficina: "Oficina",
  local: "Local Comercial",
  bodega: "Bodega"
}

const rangosPrecios = [
  { value: "0-150000", label: "Hasta $150K", min: 0, max: 150000 },
  { value: "150000-200000", label: "$150K - $200K", min: 150000, max: 200000 },
  { value: "200000-250000", label: "$200K - $250K", min: 200000, max: 250000 },
  { value: "250000-300000", label: "$250K - $300K", min: 250000, max: 300000 },
  { value: "300000-400000", label: "$300K - $400K", min: 300000, max: 400000 },
  { value: "400000-", label: "$400K+", min: 400000, max: null },
]

function buildWhereClause(
  excludeField: 'zona' | 'habitaciones' | 'precio' | 'tipo' | 'operacion' | null,
  zona: string | null,
  habitaciones: string | null,
  precioMin: string | null,
  precioMax: string | null,
  tipo: string | null,
  operacion: string | null
): { sql: string; params: any[] } {
  let conditions = ["estado = 'disponible'"]
  const params: any[] = []

  if (excludeField !== 'zona' && zona) {
    conditions.push("zona = ?")
    params.push(zona)
  }

  if (excludeField !== 'habitaciones' && habitaciones) {
    const habNum = parseInt(habitaciones)
    if (habNum >= 4) {
      conditions.push("habitaciones >= 4")
    } else {
      conditions.push("habitaciones = ?")
      params.push(habNum)
    }
  }

  if (excludeField !== 'precio') {
    if (precioMin) {
      conditions.push("precio >= ?")
      params.push(parseFloat(precioMin))
    }
    if (precioMax) {
      conditions.push("precio <= ?")
      params.push(parseFloat(precioMax))
    }
  }

  if (excludeField !== 'tipo' && tipo) {
    conditions.push("tipo = ?")
    params.push(tipo)
  }

  if (excludeField !== 'operacion' && operacion) {
    conditions.push("operacion = ?")
    params.push(operacion)
  }

  return {
    sql: conditions.join(" AND "),
    params
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const zona = searchParams.get("zona") || null
    const habitaciones = searchParams.get("habitaciones") || null
    const precioMin = searchParams.get("precio_min") || null
    const precioMax = searchParams.get("precio_max") || null
    const tipo = searchParams.get("tipo") || null
    const operacion = searchParams.get("operacion") || null

    const db = await getConnection()

    const zonasWhere = buildWhereClause('zona', zona, habitaciones, precioMin, precioMax, tipo, operacion)
    const [zonasRows]: any = await db.query(`
      SELECT DISTINCT zona, COUNT(*) as count
      FROM inmuebles
      WHERE zona IS NOT NULL AND zona != '' AND ${zonasWhere.sql}
      GROUP BY zona
      ORDER BY CAST(zona AS UNSIGNED) ASC
    `, zonasWhere.params)

    const tiposWhere = buildWhereClause('tipo', zona, habitaciones, precioMin, precioMax, tipo, operacion)
    const [tiposRows]: any = await db.query(`
      SELECT DISTINCT tipo, COUNT(*) as count
      FROM inmuebles
      WHERE ${tiposWhere.sql}
      GROUP BY tipo
      ORDER BY count DESC
    `, tiposWhere.params)

    const operacionesWhere = buildWhereClause('operacion', zona, habitaciones, precioMin, precioMax, tipo, operacion)
    const [operacionesRows]: any = await db.query(`
      SELECT DISTINCT operacion, COUNT(*) as count
      FROM inmuebles
      WHERE ${operacionesWhere.sql}
      GROUP BY operacion
    `, operacionesWhere.params)

    const habitacionesWhere = buildWhereClause('habitaciones', zona, habitaciones, precioMin, precioMax, tipo, operacion)
    const [habitacionesRows]: any = await db.query(`
      SELECT DISTINCT habitaciones, COUNT(*) as count
      FROM inmuebles
      WHERE habitaciones > 0 AND ${habitacionesWhere.sql}
      GROUP BY habitaciones
      ORDER BY habitaciones ASC
    `, habitacionesWhere.params)

    const precioWhere = buildWhereClause('precio', zona, habitaciones, precioMin, precioMax, tipo, operacion)

    const rangosConConteo = await Promise.all(
      rangosPrecios.map(async (rango) => {
        let rangoConditions = precioWhere.sql
        const rangoParams = [...precioWhere.params]

        rangoConditions += " AND precio >= ?"
        rangoParams.push(rango.min)

        if (rango.max !== null) {
          rangoConditions += " AND precio <= ?"
          rangoParams.push(rango.max)
        }

        const [countResult]: any = await db.query(`
          SELECT COUNT(*) as count
          FROM inmuebles
          WHERE moneda = 'USD' AND ${rangoConditions}
        `, rangoParams)

        return {
          ...rango,
          count: countResult[0]?.count || 0
        }
      })
    )

    const rangosDisponibles = rangosConConteo.filter(r => r.count > 0)

    const zonas = zonasRows.map((r: any) => ({
      value: r.zona,
      label: `Zona ${r.zona}`,
      subLabel: zonaLabels[r.zona] || null,
      count: r.count
    }))

    const tipos = tiposRows.map((r: any) => ({
      value: r.tipo,
      label: tipoLabels[r.tipo] || r.tipo,
      count: r.count
    }))

    const operaciones = operacionesRows.map((r: any) => ({
      value: r.operacion,
      label: r.operacion === "venta" ? "En Venta" : "En Alquiler",
      count: r.count
    }))

    const habitacionesList = habitacionesRows.map((r: any) => ({
      value: r.habitaciones.toString(),
      label: r.habitaciones === 1 ? "1 habitación" : `${r.habitaciones} habitaciones`,
      subLabel: r.habitaciones === 1 ? "Loft / Studio" :
                r.habitaciones === 2 ? "Parejas" :
                r.habitaciones === 3 ? "Familia pequeña" :
                r.habitaciones >= 4 ? "Familia grande" : null,
      count: r.count
    }))

    const allWhere = buildWhereClause(null, zona, habitaciones, precioMin, precioMax, tipo, operacion)
    const [totalResult]: any = await db.query(`
      SELECT COUNT(*) as total FROM inmuebles WHERE ${allWhere.sql}
    `, allWhere.params)

    return NextResponse.json({
      success: true,
      filters: {
        zonas,
        tipos,
        operaciones,
        habitaciones: habitacionesList,
        rangosPrecios: rangosDisponibles
      },
      totalDisponibles: totalResult[0]?.total || 0
    })
  } catch (error) {
    console.error("Error al obtener filtros:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener filtros" },
      { status: 500 }
    )
  }
}
