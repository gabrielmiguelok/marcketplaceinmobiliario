import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getInmuebleById, formatPrecio } from "@/lib/services/inmuebles-service"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import InmuebleDetailClient from "./InmuebleDetailClient"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { slugify } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string; slug: string }>
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://marketplaceinmobiliario.com"

function getOgImageUrl(url: string | null): string {
  if (!url) return `${baseUrl}/og.png`
  if (url.startsWith('/inmuebles/') || url.startsWith('/uploads/') || url.startsWith('/')) {
    return `${baseUrl}/api/imagen${url.startsWith('/') ? url : '/' + url}`
  }
  return url
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const inmueble = await getInmuebleById(parseInt(id))

  if (!inmueble) {
    return { title: "Propiedad no encontrada | Aloba" }
  }

  const tipoLabels: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    terreno: 'Terreno',
    oficina: 'Oficina',
    local: 'Local Comercial',
    bodega: 'Bodega',
  }

  const tipoLabel = tipoLabels[inmueble.tipo] || inmueble.tipo
  const operacionLabel = inmueble.operacion === 'alquiler' ? 'en Alquiler' : 'en Venta'
  const precioFormateado = inmueble.moneda === 'USD'
    ? `$${inmueble.precio.toLocaleString('en-US')}`
    : `Q${inmueble.precio.toLocaleString('es-GT')}`

  const ubicacionCompleta = [
    inmueble.zona ? `Zona ${inmueble.zona}` : null,
    inmueble.ubicacion,
    inmueble.departamento,
    'Guatemala'
  ].filter(Boolean).join(', ')

  const caracteristicas = [
    inmueble.habitaciones > 0 ? `${inmueble.habitaciones} habitaciones` : null,
    inmueble.banos > 0 ? `${inmueble.banos} baños` : null,
    inmueble.parqueos > 0 ? `${inmueble.parqueos} parqueos` : null,
    inmueble.metros_cuadrados > 0 ? `${inmueble.metros_cuadrados}m²` : null,
  ].filter(Boolean).join(', ')

  const tituloSEO = `${tipoLabel} ${operacionLabel} en ${inmueble.zona ? `Zona ${inmueble.zona}` : inmueble.ubicacion || inmueble.departamento} | ${precioFormateado}`

  const descripcionSEO = inmueble.descripcion?.slice(0, 155) ||
    `${tipoLabel} ${operacionLabel} en ${ubicacionCompleta}. ${caracteristicas}. Precio: ${precioFormateado}. Encuentra tu propiedad ideal en Aloba Guatemala.`

  const imageUrl = getOgImageUrl(inmueble.imagen_url)
  const slug = slugify(inmueble.titulo)
  const canonicalUrl = `${baseUrl}/inmuebles/${inmueble.id}/${slug}`

  const keywordsArray = [
    tipoLabel,
    `${tipoLabel} ${operacionLabel}`,
    `${tipoLabel} ${inmueble.zona ? `Zona ${inmueble.zona}` : ''}`.trim(),
    inmueble.operacion === 'alquiler' ? 'alquiler' : 'venta',
    inmueble.zona ? `Zona ${inmueble.zona}` : null,
    inmueble.zona ? `Zona ${inmueble.zona} Guatemala` : null,
    inmueble.ubicacion,
    inmueble.departamento,
    'inmuebles Guatemala',
    'propiedades Guatemala',
    'bienes raíces Guatemala',
    `${tipoLabel.toLowerCase()} en venta Guatemala`,
    `${tipoLabel.toLowerCase()} en alquiler Guatemala`,
  ].filter(Boolean) as string[]

  return {
    title: tituloSEO,
    description: descripcionSEO,
    keywords: keywordsArray,
    authors: [{ name: 'Aloba Guatemala' }],
    creator: 'Aloba - Marketplace Inmobiliario Guatemala',
    publisher: 'Aloba',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${inmueble.titulo} - ${precioFormateado}`,
      description: descripcionSEO,
      type: 'article',
      url: canonicalUrl,
      locale: 'es_GT',
      siteName: 'Aloba - Marketplace Inmobiliario Guatemala',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${tipoLabel} ${operacionLabel} - ${inmueble.titulo}`,
          type: 'image/webp',
        },
      ],
      countryName: 'Guatemala',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AlobaGT',
      creator: '@AlobaGT',
      title: `${inmueble.titulo} - ${precioFormateado}`,
      description: descripcionSEO,
      images: {
        url: imageUrl,
        alt: `${tipoLabel} ${operacionLabel} - ${inmueble.titulo}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    other: {
      'og:price:amount': inmueble.precio.toString(),
      'og:price:currency': inmueble.moneda,
      'product:price:amount': inmueble.precio.toString(),
      'product:price:currency': inmueble.moneda,
      'property:type': tipoLabel,
      'property:location': ubicacionCompleta,
      'geo.region': 'GT',
      'geo.placename': inmueble.departamento || 'Guatemala',
      'geo.position': inmueble.latitud && inmueble.longitud
        ? `${inmueble.latitud};${inmueble.longitud}`
        : undefined,
      'ICBM': inmueble.latitud && inmueble.longitud
        ? `${inmueble.latitud}, ${inmueble.longitud}`
        : undefined,
    },
  }
}

function getImageSrc(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('/inmuebles/') || url.startsWith('/uploads/')) {
    return `/api/imagen${url}`
  }
  if (url.startsWith('/') && !url.startsWith('/api/')) {
    return `/api/imagen${url}`
  }
  return url
}

export default async function InmuebleDetailPage({ params }: Props) {
  const { id, slug: urlSlug } = await params
  const inmueble = await getInmuebleById(parseInt(id))

  if (!inmueble) {
    notFound()
  }

  const correctSlug = slugify(inmueble.titulo)
  if (urlSlug !== correctSlug) {
    redirect(`/inmuebles/${inmueble.id}/${correctSlug}`)
  }

  const fallbackImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200"
  const imageUrl = getImageSrc(inmueble.imagen_url) || fallbackImage

  const tipoLabels: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    terreno: 'Terreno',
    oficina: 'Oficina',
    local: 'Local Comercial',
    bodega: 'Bodega',
  }

  const tipoLabel = tipoLabels[inmueble.tipo] || inmueble.tipo
  const operacionLabel = inmueble.operacion === 'alquiler' ? 'en Alquiler' : 'en Venta'
  const ogImageUrl = getOgImageUrl(inmueble.imagen_url)
  const canonicalUrl = `${baseUrl}/inmuebles/${inmueble.id}/${correctSlug}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": canonicalUrl,
    name: inmueble.titulo,
    description: inmueble.descripcion || `${tipoLabel} ${operacionLabel} en Guatemala`,
    url: canonicalUrl,
    datePosted: inmueble.created_at ? new Date(inmueble.created_at).toISOString() : undefined,
    image: ogImageUrl,
    offers: {
      "@type": "Offer",
      price: inmueble.precio,
      priceCurrency: inmueble.moneda,
      availability: "https://schema.org/InStock",
      validFrom: inmueble.created_at ? new Date(inmueble.created_at).toISOString() : undefined,
      businessFunction: inmueble.operacion === 'alquiler'
        ? "https://schema.org/LeaseOut"
        : "https://schema.org/Sell",
    },
    about: {
      "@type": inmueble.tipo === 'apartamento' ? "Apartment" :
              inmueble.tipo === 'casa' ? "House" :
              inmueble.tipo === 'terreno' ? "LandPlot" :
              inmueble.tipo === 'oficina' ? "Office" : "RealEstateListing",
      name: inmueble.titulo,
      description: inmueble.descripcion,
      numberOfRooms: inmueble.habitaciones > 0 ? inmueble.habitaciones : undefined,
      numberOfBathroomsTotal: inmueble.banos > 0 ? inmueble.banos : undefined,
      floorSize: inmueble.metros_cuadrados > 0 ? {
        "@type": "QuantitativeValue",
        value: inmueble.metros_cuadrados,
        unitCode: "MTK",
      } : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: inmueble.ubicacion || inmueble.departamento,
        addressRegion: inmueble.departamento,
        addressCountry: "GT",
        streetAddress: inmueble.zona ? `Zona ${inmueble.zona}` : undefined,
      },
      geo: inmueble.latitud && inmueble.longitud ? {
        "@type": "GeoCoordinates",
        latitude: inmueble.latitud,
        longitude: inmueble.longitud,
      } : undefined,
      image: ogImageUrl,
    },
    provider: {
      "@type": "RealEstateAgent",
      name: "Aloba",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      areaServed: {
        "@type": "Country",
        name: "Guatemala",
      },
    },
    areaServed: {
      "@type": "City",
      name: inmueble.departamento || "Guatemala City",
      containedInPlace: {
        "@type": "Country",
        name: "Guatemala",
      },
    },
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Inmuebles",
        item: `${baseUrl}/inmuebles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: inmueble.titulo,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#0B1B32] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header activePage="inmuebles" />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <InmuebleDetailClient
                id={inmueble.id}
                imageUrl={imageUrl}
                titulo={inmueble.titulo}
                tipo={inmueble.tipo}
                tipoLabel={tipoLabels[inmueble.tipo] || inmueble.tipo}
                operacion={inmueble.operacion}
                destacado={inmueble.destacado}
              />

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0B1B32] mb-3">
                  {inmueble.titulo}
                </h1>

                <div className="flex items-center gap-2 text-gray-500 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00F0D0]"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="font-medium">
                    {inmueble.zona ? `Zona ${inmueble.zona}, ` : ''}
                    {inmueble.ubicacion || inmueble.departamento}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {inmueble.habitaciones > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#00F0D0] mb-2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                      <div className="text-xl font-bold text-[#0B1B32]">{inmueble.habitaciones}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Habitaciones</div>
                    </div>
                  )}
                  {inmueble.banos > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#00F0D0] mb-2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>
                      <div className="text-xl font-bold text-[#0B1B32]">{inmueble.banos}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Baños</div>
                    </div>
                  )}
                  {inmueble.parqueos > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#00F0D0] mb-2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                      <div className="text-xl font-bold text-[#0B1B32]">{inmueble.parqueos}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Parqueos</div>
                    </div>
                  )}
                  {inmueble.metros_cuadrados > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#00F0D0] mb-2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>
                      <div className="text-xl font-bold text-[#0B1B32]">{inmueble.metros_cuadrados}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">m²</div>
                    </div>
                  )}
                </div>

                {inmueble.descripcion && (
                  <div>
                    <h2 className="text-lg font-bold text-[#0B1B32] mb-3">Descripción</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {inmueble.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                    {inmueble.operacion === 'alquiler' ? 'Alquiler mensual' : 'Precio de venta'}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-[#00F0D0]">
                    {formatPrecio(inmueble.precio, inmueble.moneda)}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                    <span>{tipoLabels[inmueble.tipo] || inmueble.tipo}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{inmueble.departamento}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <span>Publicado {new Date(inmueble.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href="https://wa.me/50240000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Contactar por WhatsApp
                  </a>

                  <button
                    className="w-full bg-[#0B1B32] hover:bg-[#0B1B32]/90 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    Solicitar información
                  </button>

                  <button
                    className="w-full bg-gray-100 hover:bg-gray-200 text-[#0B1B32] font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    Agendar visita
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400">
                    ID de propiedad: #{inmueble.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
