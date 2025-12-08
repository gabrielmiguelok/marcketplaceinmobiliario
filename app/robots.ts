import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://marketplaceinmobiliario.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/login",
          "/registro",
          "/perfil/",
          "/*.json$",
          "/*?*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/inmuebles/",
          "/conocenos",
          "/herramientas",
          "/inmuebles/mapa",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/login",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/inmuebles/",
          "/uploads/",
          "/images/",
          "/api/imagen/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/login",
        ],
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
      },
      {
        userAgent: "WhatsApp",
        allow: "/",
      },
      {
        userAgent: "TelegramBot",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
