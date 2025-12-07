"use client"

import { useCallback, useEffect, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import { Heart, Share2, MapPin } from "lucide-react"

const PROJECTS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800",
    title: "Villa Mariscal",
    location: "Zona 11, Guatemala",
    price: "$149,000",
    tag: "Nuevo lanzamiento"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800",
    title: "Casalini",
    location: "Zona 10, Guatemala",
    price: "$185,000"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800",
    title: "Parque 14",
    location: "Zona 14, Guatemala",
    price: "$210,000",
    tag: "Últimas unidades"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800",
    title: "Echo",
    location: "Zona 14, Guatemala",
    price: "$295,000"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800",
    title: "Di Fiori",
    location: "Zona 7, Guatemala",
    price: "$135,000"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800",
    title: "Modra",
    location: "Zona 4, Guatemala",
    price: "$120,000",
    tag: "Airbnb Friendly"
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800",
    title: "Vasanta",
    location: "Zona 10, Guatemala",
    price: "$225,000"
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800",
    title: "Vivo",
    location: "Zona 9, Guatemala",
    price: "$110,000"
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800",
    title: "Granat",
    location: "Zona 4, Guatemala",
    price: "$145,000"
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800",
    title: "Baden",
    location: "Zona 16, Guatemala",
    price: "$310,000",
    tag: "Premium"
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800",
    title: "Narama",
    location: "Zona 13, Guatemala",
    price: "$160,000"
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800",
    title: "Lirios de Cayalá",
    location: "Zona 16, Guatemala",
    price: "$280,000"
  },
  {
    id: 13,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800",
    title: "Morena",
    location: "Zona 10, Guatemala",
    price: "$240,000"
  }
]

interface ProjectCardProps {
  image: string
  title: string
  location: string
  price: string
  tag?: string
}

function ProjectCard({ image, title, location, price, tag }: ProjectCardProps) {
  return (
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
            className="w-10 h-10 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00dbbe] transition-colors shadow-md active:scale-95"
            aria-label={`Compartir proyecto ${title}`}
          >
            <Share2 size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
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
  )
}

export default function ProjectsCarouselSection() {
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

  return (
    <section
      className="w-full pt-16 pb-6 md:pt-24 md:pb-8 bg-white overflow-hidden"
      role="region"
      aria-label="Carrusel de proyectos inmobiliarios"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col items-center mb-10 md:mb-16">
        <div className="mb-8">
          <button
            type="button"
            className="border border-[#0B1B32] text-[#0B1B32] font-bold py-2.5 px-8 rounded-full text-sm hover:bg-[#0B1B32] hover:text-white transition-all"
          >
            Descubre los proyectos
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-[#0B1B32] leading-tight tracking-tight">
            Invierte con claridad.<br />
            Decide con confianza.
          </h2>
        </div>
      </div>

      <div
        className="w-full overflow-hidden"
        ref={emblaRef}
        aria-roledescription="carrusel"
      >
        <div className="flex gap-4 md:gap-8 pl-6 md:pl-[calc((100vw-1440px)/2+24px)]">
          {PROJECTS.map((project) => (
            <div key={project.id} className="flex-shrink-0">
              <ProjectCard
                image={project.image}
                title={project.title}
                location={project.location}
                price={project.price}
                tag={project.tag}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 md:mt-10 flex justify-center px-4">
        <button
          type="button"
          className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
          aria-label="Ver todos los proyectos inmobiliarios"
        >
          Ver todos los proyectos
        </button>
      </div>
    </section>
  )
}
