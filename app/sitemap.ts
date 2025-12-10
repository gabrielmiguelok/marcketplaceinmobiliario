import type { MetadataRoute } from "next"
import { query } from "@/lib/db"
import { slugify } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://marketplaceinmobiliario.com"

interface InmuebleSitemap {
  id: number
  titulo: string
  updated_at: Date | null
  created_at: Date
  tipo: string
  operacion: string
  zona: number | null
  destacado: boolean
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/conocenos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/proyectos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/proyectos/mapa`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/herramientas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  let inmuebleRoutes: MetadataRoute.Sitemap = []

  try {
    const inmuebles = await query<InmuebleSitemap>(
      `SELECT id, titulo, updated_at, created_at, tipo, operacion, zona, destacado
       FROM inmuebles
       WHERE estado = 'disponible'
       ORDER BY destacado DESC, updated_at DESC, created_at DESC`
    )

    inmuebleRoutes = inmuebles.map((inmueble) => {
      let priority = 0.6
      if (inmueble.destacado) priority = 0.8
      if (inmueble.zona && [10, 14, 15, 16].includes(inmueble.zona)) priority += 0.05
      const slug = slugify(inmueble.titulo)

      return {
        url: `${baseUrl}/proyectos/${inmueble.id}/${slug}`,
        lastModified: inmueble.updated_at || inmueble.created_at || now,
        changeFrequency: "weekly" as const,
        priority: Math.min(priority, 0.85),
      }
    })

    console.log(`[Sitemap] Generated with ${staticRoutes.length} static routes and ${inmuebleRoutes.length} property routes`)
  } catch (error) {
    console.error("[Sitemap] Error fetching properties:", error)
  }

  const operacionRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/proyectos?operacion=venta`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proyectos?operacion=alquiler`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]

  const tipoRoutes: MetadataRoute.Sitemap = [
    "apartamento",
    "casa",
    "terreno",
    "oficina",
    "local",
    "bodega",
  ].map((tipo) => ({
    url: `${baseUrl}/proyectos?tipo=${tipo}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  const zonasPopulares = [4, 9, 10, 11, 13, 14, 15, 16]
  const zonaRoutes: MetadataRoute.Sitemap = zonasPopulares.map((zona) => ({
    url: `${baseUrl}/proyectos?zona=${zona}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...operacionRoutes,
    ...tipoRoutes,
    ...zonaRoutes,
    ...inmuebleRoutes,
  ]
}

export const revalidate = 3600
export const dynamic = "force-dynamic"
