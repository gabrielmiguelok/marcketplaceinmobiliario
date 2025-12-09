import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getUserByUsuario, getInmueblesByUserId } from "@/lib/services/inmuebles-service"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import InmueblesGrid from "@/components/InmueblesGrid"
import { MapPin, Building2 } from "lucide-react"
import Link from "next/link"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { SupportChatWidget } from "@/components/chat/SupportChatWidget"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://marketplaceinmobiliario.com"

function getOgImageUrl(picture: string | null): string {
  if (!picture) {
    return `${baseUrl}/og.png`
  }
  if (picture.startsWith("http")) {
    return picture
  }
  if (picture.startsWith("/")) {
    return `${baseUrl}/api/imagen${picture}`
  }
  return `${baseUrl}${picture}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userInmobiliaria: string }>
}): Promise<Metadata> {
  const { userInmobiliaria } = await params
  const user = await getUserByUsuario(userInmobiliaria)

  if (!user) {
    return {
      title: "Inmobiliaria no encontrada",
      description: "El perfil que buscas no existe o no está disponible.",
    }
  }

  const displayName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Inmobiliaria"
  const title = `${displayName} - Propiedades | Aloba`
  const description = `Explora las propiedades de ${displayName} en Guatemala. Encuentra tu próximo hogar o inversión.`

  const pictureUrl = getOgImageUrl(user.picture)

  return {
    title,
    description,
    keywords: [
      displayName,
      "inmobiliaria",
      "propiedades",
      "Guatemala",
      "bienes raíces",
      "apartamentos",
      "casas",
      "Aloba",
    ],
    openGraph: {
      type: "profile",
      url: `${baseUrl}/${user.usuario}`,
      title,
      description,
      siteName: "Aloba - Marketplace Inmobiliario",
      images: [
        {
          url: pictureUrl,
          width: 800,
          height: 800,
          alt: displayName,
        },
      ],
      locale: "es_GT",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pictureUrl],
    },
    alternates: {
      canonical: `${baseUrl}/${user.usuario}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 0
export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ userInmobiliaria: string }>
  searchParams: Promise<{
    zona?: string
    habitaciones?: string
    precio_min?: string
    precio_max?: string
    tipo?: string
    operacion?: string
  }>
}

export default async function InmobiliariaProfilePage({ params, searchParams }: Props) {
  const { userInmobiliaria } = await params
  const queryParams = await searchParams
  const user = await getUserByUsuario(userInmobiliaria)

  if (!user) {
    notFound()
  }

  const inmuebles = await getInmueblesByUserId(user.id)
  const displayName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Inmobiliaria"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: displayName,
    description: `Propiedades de ${displayName} en Guatemala`,
    url: `${baseUrl}/${user.usuario}`,
    telephone: user.telefono,
    image: getOgImageUrl(user.picture),
    areaServed: {
      "@type": "Country",
      name: "Guatemala",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white font-sans text-[#0B1B32] flex flex-col relative selection:bg-[#00F0D0] selection:text-[#0B1B32]">
        <Header activePage="inmuebles" />

        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00F0D0] to-[#00dbbe] flex items-center justify-center">
                <Building2 className="w-10 h-10 text-[#0B1B32]" />
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-[#0B1B32] leading-tight tracking-tight mb-4">
                {displayName}
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {inmuebles.length > 0
                  ? `${inmuebles.length} propiedades disponibles`
                  : "Sin propiedades disponibles actualmente"}
              </p>
            </div>

            {inmuebles.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No hay propiedades disponibles
                </h2>
                <p className="text-gray-600 mb-8">
                  Esta inmobiliaria aún no tiene propiedades publicadas.
                </p>
                <Link
                  href="/inmuebles"
                  className="inline-flex items-center gap-2 bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-8 rounded-full transition-all duration-300"
                >
                  Ver todas las propiedades
                </Link>
              </div>
            ) : (
              <InmueblesGrid
                inmuebles={inmuebles as any}
                initialFilters={{
                  zona: queryParams.zona || "",
                  habitaciones: queryParams.habitaciones || "",
                  precioMin: queryParams.precio_min || "",
                  precioMax: queryParams.precio_max || "",
                  tipo: queryParams.tipo || "",
                  operacion: queryParams.operacion || ""
                }}
              />
            )}
          </div>
        </main>

        <Footer />
        <WhatsAppButton />
        <SupportChatWidget />
      </div>
    </>
  )
}
