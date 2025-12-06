import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DocTop",
    short_name: "DocTop",
    description:
      "Plataforma integral para profesionales de la salud. Gestiona tu práctica médica, conecta con pacientes y administra citas en línea.",
    start_url: "/",
    display: "fullscreen",
    display_override: ["fullscreen", "standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#FFFFFF",
    theme_color: "#6B9EF2",
    scope: "/",
    lang: "es-MX",
    dir: "ltr",
    categories: ["healthcare", "medical", "business", "productivity"],
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
