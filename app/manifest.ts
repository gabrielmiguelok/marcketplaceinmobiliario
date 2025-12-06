import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aloba - Marketplace Inmobiliario",
    short_name: "Aloba",
    description:
      "Encuentra la propiedad perfecta para ti. Plataforma inmobiliaria con proyectos nuevos, herramientas inteligentes y asesoría personalizada en Guatemala.",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#FFFFFF",
    theme_color: "#00F0D0",
    scope: "/",
    lang: "es-GT",
    dir: "ltr",
    categories: ["real estate", "business", "lifestyle", "productivity"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
