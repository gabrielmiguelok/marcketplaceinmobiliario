"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import { Heart, Share2, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { generateInmuebleUrl } from "@/lib/utils"

interface Inmueble {
  id: number
  titulo: string
  tipo: string
  operacion: string
  precio: number
  moneda: string
  ubicacion: string
  zona: string
  departamento: string
  metros_cuadrados: number
  habitaciones: number
  banos: number
  parqueos: number
  imagen_url: string | null
  destacado: boolean
  estado: string
}

interface ProjectCardProps {
  id: number
  image: string
  title: string
  location: string
  price: string
  tag?: string
}

function getImageSrc(url: string | null): string {
  const fallback = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800"
  if (!url) return fallback
  if (url.startsWith('/inmuebles/') || url.startsWith('/uploads/')) {
    return `/api/imagen${url}`
  }
  if (url.startsWith('/') && !url.startsWith('/api/')) {
    return `/api/imagen${url}`
  }
  return url
}

function formatPrecio(precio: number, moneda: string): string {
  if (moneda === 'USD') {
    return `$${precio.toLocaleString('en-US')}`
  }
  return `Q${precio.toLocaleString('es-GT')}`
}

function ProjectCard({ id, image, title, location, price, tag }: ProjectCardProps) {
  return (
    <Link href={generateInmuebleUrl(id, title)}>
      <article
        className="relative group w-[85vw] md:w-[320px] lg:w-[350px] h-[450px] md:h-[480px] rounded-[2rem] overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer bg-white flex-shrink-0 border border-gray-100"
        role="group"
        aria-label={`Proyecto ${title} en ${location}`}
        itemScope
        itemType="https://schema.org/RealEstateListing"
      >
        <img
          src={image}
          alt={`Imagen del proyecto inmobiliario ${title} en ${location}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800' }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-40 pointer-events-none" />

        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
          {tag ? (
            <span className="bg-gray-100/95 backdrop-blur-md text-[#0B1B32] text-xs font-bold px-4 py-2 rounded-full shadow-sm">
              {tag}
            </span>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="w-10 h-10 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00dbbe] transition-colors shadow-md active:scale-95"
              aria-label={`Compartir proyecto ${title}`}
            >
              <Share2 size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="w-10 h-10 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00dbbe] transition-colors shadow-md active:scale-95"
              aria-label={`Guardar proyecto ${title} en favoritos`}
            >
              <Heart size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-[#0B1B32] p-6 pt-6 pb-8 z-10">
          <h3 className="text-white text-xl font-bold mb-1.5 line-clamp-1" itemProp="name">{title}</h3>
          <p className="text-gray-300 text-sm font-medium mb-2 opacity-80 flex items-center gap-1" itemProp="address">
            <MapPin size={14} aria-hidden="true" />
            {location}
          </p>
          <div className="text-[#00F0D0] font-bold text-xl mt-1" itemProp="price">Desde: {price}</div>
        </div>
      </article>
    </Link>
  )
}

export default function ProjectsCarouselSection() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [loading, setLoading] = useState(true)
  const autoScrollRef = useRef<ReturnType<typeof AutoScroll> | null>(null)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: true,
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        playOnInit: true,
      })
    ]
  )

  useEffect(() => {
    async function fetchInmuebles() {
      try {
        const res = await fetch('/api/inmuebles?limit=20')
        const data = await res.json()
        if (data.success && data.inmuebles) {
          setInmuebles(data.inmuebles)
        }
      } catch (error) {
        console.error('Error cargando inmuebles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInmuebles()
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    const autoScroll = emblaApi.plugins().autoScroll
    if (autoScroll) {
      autoScrollRef.current = autoScroll as ReturnType<typeof AutoScroll>
    }
  }, [emblaApi])

  const handlePointerDown = useCallback(() => {
    if (autoScrollRef.current) {
      autoScrollRef.current.stop()
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (autoScrollRef.current) {
      autoScrollRef.current.play()
    }
  }, [])

  useEffect(() => {
    const container = emblaApi?.rootNode()
    if (!container) return

    container.addEventListener("pointerdown", handlePointerDown)
    container.addEventListener("pointerup", handlePointerUp)
    container.addEventListener("pointerleave", handlePointerUp)

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown)
      container.removeEventListener("pointerup", handlePointerUp)
      container.removeEventListener("pointerleave", handlePointerUp)
    }
  }, [emblaApi, handlePointerDown, handlePointerUp])

  const getTag = (inmueble: Inmueble): string | undefined => {
    if (inmueble.destacado) return "Destacado"
    if (inmueble.operacion === "alquiler") return "En Alquiler"
    return undefined
  }

  const getLocation = (inmueble: Inmueble): string => {
    if (inmueble.zona) {
      return `Zona ${inmueble.zona}, ${inmueble.departamento || 'Guatemala'}`
    }
    return inmueble.ubicacion || inmueble.departamento || 'Guatemala'
  }

  return (
    <section
      className="w-full pt-16 pb-6 md:pt-24 md:pb-8 bg-white overflow-hidden"
      role="region"
      aria-label="Carrusel de proyectos inmobiliarios"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col items-center mb-10 md:mb-16">
        <div className="mb-8">
          <Link
            href="/inmuebles"
            className="border border-[#0B1B32] text-[#0B1B32] font-bold py-2.5 px-8 rounded-full text-sm hover:bg-[#0B1B32] hover:text-white transition-all"
          >
            Descubre los proyectos
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-[#0B1B32] leading-tight tracking-tight">
            Invierte con claridad.<br />
            Decide con confianza.
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[480px]">
          <Loader2 className="w-10 h-10 text-[#00F0D0] animate-spin" />
        </div>
      ) : inmuebles.length === 0 ? (
        <div className="flex justify-center items-center h-[480px] text-gray-500">
          No hay propiedades disponibles
        </div>
      ) : (
        <div
          className="w-full overflow-hidden"
          ref={emblaRef}
          aria-roledescription="carrusel"
        >
          <div className="flex gap-4 md:gap-8 pl-6 md:pl-[calc((100vw-1440px)/2+24px)]">
            {inmuebles.map((inmueble) => (
              <div key={inmueble.id} className="flex-shrink-0">
                <ProjectCard
                  id={inmueble.id}
                  image={getImageSrc(inmueble.imagen_url)}
                  title={inmueble.titulo}
                  location={getLocation(inmueble)}
                  price={formatPrecio(inmueble.precio, inmueble.moneda)}
                  tag={getTag(inmueble)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 md:mt-10 flex justify-center px-4">
        <Link
          href="/inmuebles"
          className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
          aria-label="Ver todos los proyectos inmobiliarios"
        >
          Ver todos los proyectos
        </Link>
      </div>
    </section>
  )
}
