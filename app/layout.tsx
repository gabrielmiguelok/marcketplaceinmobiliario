import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
})

const brandName = "Aloba - Marketplace Inmobiliario"
const brandDescription =
  "Encuentra la propiedad perfecta para ti. Plataforma inmobiliaria con proyectos nuevos, herramientas inteligentes y asesoría personalizada."
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aloba.gt"


export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: brandName,
    template: `%s | ${brandName}`,
  },
  description: brandDescription,
  applicationName: "Aloba",
  generator: "Next.js 14",
  authors: [{ name: "Aloba Platform" }],
  keywords: [
    "inmobiliaria",
    "propiedades",
    "apartamentos",
    "casas",
    "bienes raíces",
    "Guatemala",
    "zona 15",
    "proyectos nuevos",
    "venta de propiedades",
    "alquiler de propiedades",
    "marketplace inmobiliario",
    "inversión inmobiliaria",
    "propiedades en venta",
    "propiedades en alquiler",
    "desarrollos inmobiliarios",
    "casas en venta Guatemala",
    "apartamentos en venta Guatemala",
  ],
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: brandName,
    title: brandName,
    description: brandDescription,
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "Aloba - Marketplace Inmobiliario",
      },
    ],
    locale: "es_GT",
  },
  twitter: {
    card: "summary_large_image",
    title: brandName,
    description: brandDescription,
    images: [`${baseUrl}/og.png`],
  },
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
} satisfies Metadata

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00F0D0" },
    { media: "(prefers-color-scheme: dark)", color: "#00F0D0" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isProd = process.env.NODE_ENV === "production"
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-PQX7WP0XLS"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Aloba",
    description: brandDescription,
    url: baseUrl,
    areaServed: {
      "@type": "City",
      name: "Guatemala City",
      "@id": "https://www.wikidata.org/wiki/Q1555",
    },
    serviceType: [
      "Venta de propiedades",
      "Alquiler de propiedades",
      "Proyectos nuevos",
      "Asesoría inmobiliaria",
      "Inversión inmobiliaria",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "850",
      bestRating: "5",
      worstRating: "1",
    },
  }

  return (
    <html lang="es" suppressHydrationWarning className={`${nunito.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&display=swap"
          as="style"
        />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="canonical" href={baseUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${nunito.className} flex flex-col min-h-screen text-foreground antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#00F0D0] focus:text-[#0B1B32] focus:rounded-lg focus:font-bold"
        >
          Saltar al contenido principal
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <main id="main-content" className="flex-grow" role="main">{children}</main>
          <Toaster richColors position="top-center" expand={true} duration={4000} closeButton={true} />
        </ThemeProvider>

        {isProd && (
          <>
            <Suspense fallback={null}>
              <GoogleAnalytics id={gaId} />
            </Suspense>
            {process.env.NEXT_PUBLIC_CLARITY_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </html>
  )
}
