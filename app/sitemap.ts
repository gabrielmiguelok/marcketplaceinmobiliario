import type { MetadataRoute } from "next"
import { query } from "@/lib/db"

const baseUrl = "https://doctop.space"

interface DoctorSitemap {
  usuario: string
  updated_at: Date | null
}

async function getConfirmedDoctors(): Promise<DoctorSitemap[]> {
  try {
    const doctors = await query<DoctorSitemap>(
      `SELECT usuario, updated_at
       FROM users
       WHERE role = 'doctor'
         AND estado = 'confirmado'
         AND usuario IS NOT NULL
         AND usuario != ''
       ORDER BY updated_at DESC`
    )
    return doctors
  } catch (error) {
    console.error("[Sitemap] Error fetching doctors:", error)
    return []
  }
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
      url: `${baseUrl}/planes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/beneficios`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const doctors = await getConfirmedDoctors()

  const doctorRoutes: MetadataRoute.Sitemap = doctors.map((doctor) => ({
    url: `${baseUrl}/${doctor.usuario}`,
    lastModified: doctor.updated_at || now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  console.log(`[Sitemap] Generated with ${staticRoutes.length} static routes and ${doctorRoutes.length} doctor profiles`)

  return [...staticRoutes, ...doctorRoutes]
}

export const revalidate = 3600
export const dynamic = "force-dynamic"
