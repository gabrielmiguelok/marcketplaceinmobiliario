import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function GET() {
  try {
    const db = await getConnection()

    const [zonasRows]: any = await db.query(`
      SELECT DISTINCT zona, COUNT(*) as count
      FROM inmuebles
      WHERE zona IS NOT NULL AND zona != '' AND estado = 'disponible'
      GROUP BY zona
      ORDER BY CAST(zona AS UNSIGNED) ASC
    `)

    const [tiposRows]: any = await db.query(`
      SELECT DISTINCT tipo, COUNT(*) as count
      FROM inmuebles
      WHERE estado = 'disponible'
      GROUP BY tipo
      ORDER BY count DESC
    `)

    const [operacionesRows]: any = await db.query(`
      SELECT DISTINCT operacion, COUNT(*) as count
      FROM inmuebles
      WHERE estado = 'disponible'
      GROUP BY operacion
    `)

    const [habitacionesRows]: any = await db.query(`
      SELECT DISTINCT habitaciones, COUNT(*) as count
      FROM inmuebles
      WHERE estado = 'disponible' AND habitaciones > 0
      GROUP BY habitaciones
      ORDER BY habitaciones ASC
    `)

    const [preciosRows]: any = await db.query(`
      SELECT
        MIN(precio) as min_precio,
        MAX(precio) as max_precio,
        AVG(precio) as avg_precio
      FROM inmuebles
      WHERE estado = 'disponible' AND moneda = 'USD'
    `)

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

    const zonas = zonasRows.map((r: any) => ({
      value: r.zona,
      label: `Zona ${r.zona}`,
      subLabel: zonaLabels[r.zona] || null,
      count: r.count
    }))

    const tipoLabels: Record<string, string> = {
      apartamento: "Apartamento",
      casa: "Casa",
      terreno: "Terreno",
      oficina: "Oficina",
      local: "Local Comercial",
      bodega: "Bodega"
    }

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

    const habitaciones = habitacionesRows.map((r: any) => ({
      value: r.habitaciones.toString(),
      label: r.habitaciones === 1 ? "1 habitación" : `${r.habitaciones} habitaciones`,
      subLabel: r.habitaciones === 1 ? "Loft / Studio" :
                r.habitaciones === 2 ? "Parejas" :
                r.habitaciones === 3 ? "Familia pequeña" :
                r.habitaciones >= 4 ? "Familia grande" : null,
      count: r.count
    }))

    const precioStats = preciosRows[0] || { min_precio: 0, max_precio: 0, avg_precio: 0 }

    const rangosPrecios = [
      { value: "0-150000", label: "Hasta $150K", min: 0, max: 150000 },
      { value: "150000-200000", label: "$150K - $200K", min: 150000, max: 200000 },
      { value: "200000-250000", label: "$200K - $250K", min: 200000, max: 250000 },
      { value: "250000-300000", label: "$250K - $300K", min: 250000, max: 300000 },
      { value: "300000-400000", label: "$300K - $400K", min: 300000, max: 400000 },
      { value: "400000-", label: "$400K+", min: 400000, max: null },
    ]

    return NextResponse.json({
      success: true,
      filters: {
        zonas,
        tipos,
        operaciones,
        habitaciones,
        rangosPrecios,
        precioStats: {
          min: Number(precioStats.min_precio) || 0,
          max: Number(precioStats.max_precio) || 0,
          avg: Number(precioStats.avg_precio) || 0
        }
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
