import { cache } from 'react'
import { getConnection } from '@/lib/db'

export interface Inmueble {
  id: number
  titulo: string
  descripcion: string
  tipo: 'apartamento' | 'casa' | 'terreno' | 'oficina' | 'local' | 'bodega'
  operacion: 'venta' | 'alquiler'
  precio_usd: number
  precio_gtq: number
  moneda: 'USD' | 'GTQ'
  ubicacion: string
  zona: string
  departamento: string
  metros_cuadrados: number
  habitaciones: number
  banos: number
  parqueos: number
  imagen_url: string | null
  destacado: boolean
  estado: 'disponible' | 'vendido' | 'reservado' | 'inactivo'
  latitud: number | null
  longitud: number | null
  created_at: Date
  updated_at: Date
}

export const getInmuebles = cache(async (): Promise<Inmueble[]> => {
  try {
    const db = await getConnection()
    const [rows] = await db.query(`
      SELECT * FROM inmuebles
      WHERE estado = 'disponible'
      ORDER BY destacado DESC, created_at DESC
    `)

    return rows as Inmueble[]
  } catch (error) {
    console.error('Error al obtener inmuebles:', error)
    return []
  }
})

export const getInmuebleById = cache(async (id: number): Promise<Inmueble | null> => {
  try {
    const db = await getConnection()
    const [rows]: any = await db.query('SELECT * FROM inmuebles WHERE id = ?', [id])

    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error('Error al obtener inmueble:', error)
    return null
  }
})

export const getInmueblesByTipo = cache(async (tipo: string): Promise<Inmueble[]> => {
  try {
    const db = await getConnection()
    const [rows] = await db.query(`
      SELECT * FROM inmuebles
      WHERE tipo = ? AND estado = 'disponible'
      ORDER BY destacado DESC, created_at DESC
    `, [tipo])

    return rows as Inmueble[]
  } catch (error) {
    console.error('Error al obtener inmuebles por tipo:', error)
    return []
  }
})

export const getInmueblesByZona = cache(async (zona: string): Promise<Inmueble[]> => {
  try {
    const db = await getConnection()
    const [rows] = await db.query(`
      SELECT * FROM inmuebles
      WHERE zona = ? AND estado = 'disponible'
      ORDER BY destacado DESC, created_at DESC
    `, [zona])

    return rows as Inmueble[]
  } catch (error) {
    console.error('Error al obtener inmuebles por zona:', error)
    return []
  }
})

export const getZonasDisponibles = cache(async (): Promise<string[]> => {
  try {
    const db = await getConnection()
    const [rows]: any = await db.query(`
      SELECT DISTINCT zona FROM inmuebles
      WHERE zona IS NOT NULL AND zona != '' AND estado = 'disponible'
      ORDER BY zona ASC
    `)

    return rows.map((r: any) => r.zona)
  } catch (error) {
    console.error('Error al obtener zonas:', error)
    return []
  }
})

export const getTiposDisponibles = cache(async (): Promise<string[]> => {
  try {
    const db = await getConnection()
    const [rows]: any = await db.query(`
      SELECT DISTINCT tipo FROM inmuebles
      WHERE estado = 'disponible'
      ORDER BY tipo ASC
    `)

    return rows.map((r: any) => r.tipo)
  } catch (error) {
    console.error('Error al obtener tipos:', error)
    return []
  }
})

export function formatPrecioUsd(precioUsd: number | string): string {
  const precio = Number(precioUsd) || 0
  return `$${precio.toLocaleString('en-US')}`
}

export function formatPrecioGtq(precioGtq: number | string): string {
  const precio = Number(precioGtq) || 0
  return `Q${precio.toLocaleString('es-GT')}`
}

export function formatPrecio(precioUsd: number | string, precioGtq: number | string, moneda: string): string {
  if (moneda === 'USD') {
    const precio = Number(precioUsd) || 0
    return `$${precio.toLocaleString('en-US')}`
  }
  const precio = Number(precioGtq) || 0
  return `Q${precio.toLocaleString('es-GT')}`
}

export interface UserInmobiliaria {
  id: number
  usuario: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  picture: string | null
  telefono: string | null
  role: string
}

export const getUserByUsuario = cache(async (usuario: string): Promise<UserInmobiliaria | null> => {
  try {
    const db = await getConnection()
    const [rows]: any = await db.query(
      `SELECT id, usuario, email, full_name, first_name, last_name, picture, telefono, role
       FROM users
       WHERE usuario = ? AND role = 'admin'
       LIMIT 1`,
      [usuario]
    )
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return null
  }
})

export const getInmueblesByUserId = cache(async (userId: number): Promise<Inmueble[]> => {
  try {
    const db = await getConnection()
    const [rows] = await db.query(`
      SELECT * FROM inmuebles
      WHERE user_id = ? AND estado = 'disponible'
      ORDER BY destacado DESC, created_at DESC
    `, [userId])

    return rows as Inmueble[]
  } catch (error) {
    console.error('Error al obtener inmuebles por usuario:', error)
    return []
  }
})
