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

function buildBaseConditions(
  zona: string | null,
  habitaciones: string | null,
  precioMin: string | null,
  precioMax: string | null
): { sql: string; params: any[] } {
  let conditions = ["estado = 'disponible'"]
  const params: any[] = []

  if (zona) {
    conditions.push("zona = ?")
    params.push(zona)
  }

  if (habitaciones) {
    const habNum = parseInt(habitaciones)
    if (habNum === 0) {
      conditions.push("(habitaciones = 0 OR habitaciones IS NULL)")
    } else if (habNum >= 4) {
      conditions.push("habitaciones >= 4")
    } else {
      conditions.push("habitaciones = ?")
      params.push(habNum)
    }
  }

  if (precioMin) {
    conditions.push("precio >= ?")
    params.push(parseFloat(precioMin))
  }

  if (precioMax) {
    conditions.push("precio <= ?")
    params.push(parseFloat(precioMax))
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

    const db = await getConnection()

    const baseWhere = buildBaseConditions(zona, habitaciones, precioMin, precioMax)
    const [totalResult]: any = await db.query(
      `SELECT COUNT(*) as total FROM inmuebles WHERE ${baseWhere.sql}`,
      baseWhere.params
    )
    const totalDisponibles = totalResult[0]?.total || 0

    const zonasBase = buildBaseConditions(null, habitaciones, precioMin, precioMax)
    const [zonasRows]: any = await db.query(`
      SELECT zona, COUNT(*) as count
      FROM inmuebles
      WHERE zona IS NOT NULL AND zona != '' AND ${zonasBase.sql}
      GROUP BY zona
      ORDER BY CAST(zona AS UNSIGNED) ASC
    `, zonasBase.params)

    const zonas = zonasRows.map((r: any) => ({
      value: r.zona,
      label: `Zona ${r.zona}`,
      subLabel: zonaLabels[r.zona] || null,
      count: r.count
    }))

    const habitacionesBase = buildBaseConditions(zona, null, precioMin, precioMax)
    const [habitacionesRows]: any = await db.query(`
      SELECT habitaciones, COUNT(*) as count
      FROM inmuebles
      WHERE habitaciones > 0 AND ${habitacionesBase.sql}
      GROUP BY habitaciones
      ORDER BY habitaciones ASC
    `, habitacionesBase.params)

    const [sinHabitacionesResult]: any = await db.query(`
      SELECT COUNT(*) as count
      FROM inmuebles
      WHERE (habitaciones = 0 OR habitaciones IS NULL) AND ${habitacionesBase.sql}
    `, habitacionesBase.params)
    const sinHabitaciones = sinHabitacionesResult[0]?.count || 0

    const habitacionesList = habitacionesRows.map((r: any) => ({
      value: r.habitaciones.toString(),
      label: r.habitaciones === 1 ? "1 habitación" : `${r.habitaciones} habitaciones`,
      subLabel: r.habitaciones === 1 ? "Loft / Studio" :
                r.habitaciones === 2 ? "Parejas" :
                r.habitaciones === 3 ? "Familia pequeña" :
                r.habitaciones >= 4 ? "Familia grande" : null,
      count: r.count
    }))

    const preciosBase = buildBaseConditions(zona, habitaciones, null, null)
    const rangosConConteo = await Promise.all(
      rangosPrecios.map(async (rango) => {
        let rangoConditions = preciosBase.sql
        const rangoParams = [...preciosBase.params]

        rangoConditions += " AND precio >= ?"
        rangoParams.push(rango.min)

        if (rango.max !== null) {
          rangoConditions += " AND precio <= ?"
          rangoParams.push(rango.max)
        }

        const [countResult]: any = await db.query(`
          SELECT COUNT(*) as count
          FROM inmuebles
          WHERE ${rangoConditions}
        `, rangoParams)

        return {
          ...rango,
          count: countResult[0]?.count || 0
        }
      })
    )

    const rangosDisponibles = rangosConConteo.filter(r => r.count > 0)

    const tiposBase = buildBaseConditions(zona, habitaciones, precioMin, precioMax)
    const [tiposRows]: any = await db.query(`
      SELECT tipo, COUNT(*) as count
      FROM inmuebles
      WHERE ${tiposBase.sql}
      GROUP BY tipo
      ORDER BY count DESC
    `, tiposBase.params)

    const tipos = tiposRows.map((r: any) => ({
      value: r.tipo,
      label: tipoLabels[r.tipo] || r.tipo,
      count: r.count
    }))

    const operacionesBase = buildBaseConditions(zona, habitaciones, precioMin, precioMax)
    const [operacionesRows]: any = await db.query(`
      SELECT operacion, COUNT(*) as count
      FROM inmuebles
      WHERE ${operacionesBase.sql}
      GROUP BY operacion
    `, operacionesBase.params)

    const operaciones = operacionesRows.map((r: any) => ({
      value: r.operacion,
      label: r.operacion === "venta" ? "En Venta" : "En Alquiler",
      count: r.count
    }))

    const sumaHabitaciones = habitacionesList.reduce((acc: number, h: any) => acc + h.count, 0)
    const totalConHabitaciones = sumaHabitaciones + sinHabitaciones

    return NextResponse.json({
      success: true,
      filters: {
        zonas,
        tipos,
        operaciones,
        habitaciones: habitacionesList,
        rangosPrecios: rangosDisponibles,
        sinHabitaciones
      },
      totalDisponibles,
      debug: {
        sumaZonas: zonas.reduce((acc: number, z: any) => acc + z.count, 0),
        sumaHabitaciones: totalConHabitaciones,
        sumaPrecios: rangosConConteo.reduce((acc: number, r: any) => acc + r.count, 0)
      }
    })
  } catch (error) {
    console.error("Error al obtener filtros:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener filtros" },
      { status: 500 }
    )
  }
}
