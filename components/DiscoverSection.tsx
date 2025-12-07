"use client"

import { useState, useEffect } from "react"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')

const IconArrowUpRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
)

const IconX = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
)

interface CardData {
  id: string
  title: string
  description: string
  fullDescription: string
  bgColor: string
  textColor: string
  hasArrow?: boolean
  hasCutout?: boolean
  isImage?: boolean
  imageUrl?: string
  colSpan?: string
}

const CARDS: CardData[] = [
  {
    id: "acceso",
    title: "Acceso exclusivo",
    description: "Descubre lanzamientos y preventas antes que nadie.",
    fullDescription: "Obtén acceso anticipado a los mejores proyectos inmobiliarios. Sé el primero en conocer lanzamientos, preventas exclusivas y oportunidades de inversión antes que el público general.",
    bgColor: "bg-[#0B1B32]",
    textColor: "text-white",
    hasArrow: true
  },
  {
    id: "imagen",
    title: "",
    description: "",
    fullDescription: "",
    bgColor: "",
    textColor: "",
    isImage: true,
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200",
    colSpan: "lg:col-span-2"
  },
  {
    id: "comunidad",
    title: "Comunidad",
    description: "Únete a una red confiable y accede a información exclusiva del mercado.",
    fullDescription: "Forma parte de una comunidad de compradores, inversionistas y profesionales del sector inmobiliario. Comparte experiencias, obtén recomendaciones y accede a información privilegiada del mercado.",
    bgColor: "bg-[#0B1B32]",
    textColor: "text-white",
    hasArrow: true
  },
  {
    id: "clasificado",
    title: "No somos un clasificado.",
    description: "Tampoco somos una agencia. Somos una plataforma de conexión, educación y decisión.",
    fullDescription: "Aloba es diferente. No publicamos anuncios sin verificar ni cobramos comisiones. Somos tu aliado para conectar directamente con desarrolladores, educarte sobre el mercado y ayudarte a tomar la mejor decisión de inversión.",
    bgColor: "bg-[#D1FAE5]",
    textColor: "text-[#0B1B32]"
  },
  {
    id: "personalizacion",
    title: "Personalización",
    description: "Guarda, compara y recibe alertas personalizadas en un solo lugar.",
    fullDescription: "Tu experiencia, a tu medida. Guarda tus proyectos favoritos, compáralos lado a lado, configura alertas de precio y recibe notificaciones cuando aparezcan propiedades que coincidan con tus criterios.",
    bgColor: "bg-[#0B1B32]",
    textColor: "text-white",
    hasCutout: true
  },
  {
    id: "paraquien",
    title: "Para quién es aloba",
    description: "Diseñado para compradores, inversionistas y profesionales.",
    fullDescription: "Ya seas un comprador primerizo buscando tu primer hogar, un inversionista experimentado diversificando su portafolio, o un profesional del sector buscando herramientas, aloba tiene algo para ti. Información real, verificada y transparente.",
    bgColor: "bg-[#F3F4F6]",
    textColor: "text-[#0B1B32]",
    colSpan: "lg:col-span-2"
  }
]

export default function DiscoverSection() {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)

  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedCard])

  const handleCardClick = (card: CardData) => {
    if (!card.isImage && window.innerWidth < 768) {
      setSelectedCard(card)
    }
  }

  return (
    <section className="w-full py-10 md:py-24 bg-white">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-6 md:mb-12 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 md:gap-8">
          <div className="flex flex-col items-start">
            <div className="border border-[#0B1B32] rounded-full px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold mb-3 md:mb-4">
              Porque registrarte...
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#0B1B32]">
              Descubre más con aloba
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6 w-full lg:w-auto lg:max-w-md">
            <p className="text-sm md:text-lg font-medium opacity-90 lg:text-right text-[#0B1B32] flex-1">
              Regístrate gratis y desbloquea beneficios exclusivos.
            </p>
            <button className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-sm md:text-lg py-2.5 px-6 md:py-3 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm whitespace-nowrap">
              Registrarme
            </button>
          </div>
        </div>

        {/* Mobile: Scroll horizontal con tarjetas tipo desktop */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CARDS.filter(c => !c.isImage).map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={cn(
                  "flex-shrink-0 w-[280px] h-[320px] rounded-[1.5rem] p-6 flex flex-col justify-between cursor-pointer snap-center transition-transform active:scale-[0.98]",
                  card.bgColor
                )}
              >
                <div className="flex flex-col gap-3">
                  <h3 className={cn("text-xl font-bold", card.textColor)}>{card.title}</h3>
                  <p className={cn("font-medium leading-snug text-sm opacity-80", card.textColor)}>
                    {card.description}
                  </p>
                </div>

                {card.hasArrow && (
                  <div className="self-end">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-[#0B1B32]">
                      <IconArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {card.hasCutout && (
                  <div className="self-end relative">
                    <div className="absolute bottom-[-24px] right-[-24px] w-20 h-20 bg-white rounded-tl-[1.5rem]"></div>
                    <div className="relative z-10 w-10 h-10 rounded-full border-2 border-[#0B1B32] flex items-center justify-center text-[#0B1B32] bg-white">
                      <IconArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {!card.hasArrow && !card.hasCutout && (
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={cn("text-xs font-bold opacity-60", card.textColor)}>Toca para ver más</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Desliza para ver más • Toca para expandir
          </p>
        </div>

        {/* Desktop: Bento Grid original */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Acceso exclusivo */}
          <div className="relative rounded-[2rem] overflow-hidden bg-[#0B1B32] p-8 flex flex-col justify-between text-white h-[340px] group hover:shadow-xl transition-all">
            <div className="flex flex-col gap-4 relative z-10">
              <h3 className="text-2xl font-bold">Acceso exclusivo</h3>
              <p className="font-medium opacity-80 leading-snug">
                Descubre lanzamientos y preventas antes que nadie.
              </p>
            </div>
            <div className="self-end mt-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-white flex items-center justify-center text-[#0B1B32] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                <IconArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 2: Imagen Wide */}
          <div className="relative rounded-[2rem] overflow-hidden h-[340px] lg:col-span-2 group">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200"
              alt="Reunión de negocios"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </div>

          {/* Card 3: Comunidad */}
          <div className="relative rounded-[2rem] overflow-hidden bg-[#0B1B32] p-8 flex flex-col justify-between text-white h-[340px] group hover:shadow-xl transition-all">
            <div className="flex flex-col gap-4 relative z-10">
              <h3 className="text-2xl font-bold">Comunidad</h3>
              <p className="font-medium opacity-80 leading-snug">
                Únete a una red confiable y accede a información exclusiva del mercado.
              </p>
            </div>
            <div className="self-end mt-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-white flex items-center justify-center text-[#0B1B32] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                <IconArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 4: No somos un clasificado */}
          <div className="relative rounded-[2rem] overflow-hidden bg-[#D1FAE5] p-8 flex flex-col justify-center gap-4 h-[340px] hover:shadow-xl transition-all">
            <h3 className="text-2xl font-bold text-[#0B1B32]">No somos un clasificado.</h3>
            <p className="font-medium text-[#0B1B32] opacity-90 leading-snug">
              Tampoco somos una agencia. Somos una plataforma de conexión, educación y decisión.
            </p>
          </div>

          {/* Card 5: Personalización */}
          <div className="relative rounded-[2rem] overflow-hidden bg-[#0B1B32] h-[340px] group hover:shadow-xl transition-all">
            <div className="p-8 pb-20 h-full flex flex-col justify-between relative z-10">
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-white">Personalización</h3>
                <p className="font-medium text-white opacity-80 leading-snug">
                  Guarda, compara y recibe alertas personalizadas en un solo lugar.
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white z-20 rounded-tl-[2rem]"></div>

            <div className="absolute bottom-6 right-6 z-30">
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#0B1B32] text-[#0B1B32] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                <IconArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 6: Para quién es aloba */}
          <div className="relative rounded-[2rem] overflow-hidden bg-[#F3F4F6] flex items-center h-[340px] lg:col-span-2 hover:shadow-xl transition-all">
            <div className="p-12 w-full lg:w-2/3 flex flex-col justify-center items-start gap-6 relative z-10">
              <div className="border border-[#0B1B32] rounded-full px-5 py-2 text-sm font-bold bg-transparent">
                Para quién es aloba...
              </div>
              <p className="text-lg font-bold text-[#0B1B32] leading-snug max-w-sm">
                Diseñado para compradores, inversionistas y profesionales.
                <br/>Información real y verificada.
                <br/>Transparencia en todo momento.
                <br/>Herramientas que simplifican decisiones.
              </p>
            </div>

            <div className="absolute right-0 bottom-[-20px] w-1/2 h-[120%]">
              <div className="absolute top-10 right-10 w-[200px] h-[400px] bg-black rounded-[2.5rem] border-8 border-gray-800 shadow-2xl rotate-[-15deg] overflow-hidden translate-y-10 translate-x-10 ring-1 ring-white/20">
                <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400" alt="App preview" className="w-full h-full object-cover opacity-80"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <div className="text-white text-xs font-bold mb-2">Proyecto Destacado</div>
                  <div className="h-2 w-16 bg-white/50 rounded mb-2"></div>
                  <div className="h-2 w-10 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal para mobile */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center md:hidden"
          onClick={() => setSelectedCard(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            className={cn(
              "relative w-full max-h-[85vh] rounded-t-[2rem] p-6 pb-10 animate-in slide-in-from-bottom duration-300",
              selectedCard.bgColor
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle de arrastre */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full" />

            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedCard(null)}
              className={cn(
                "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                selectedCard.textColor === "text-white" ? "bg-white/20 hover:bg-white/30" : "bg-black/10 hover:bg-black/20"
              )}
            >
              <IconX className={cn("w-5 h-5", selectedCard.textColor)} />
            </button>

            <div className="mt-6 flex flex-col gap-4">
              <h3 className={cn("text-2xl font-bold", selectedCard.textColor)}>
                {selectedCard.title}
              </h3>
              <p className={cn("text-base font-medium leading-relaxed opacity-90", selectedCard.textColor)}>
                {selectedCard.fullDescription}
              </p>

              <button className="mt-4 bg-[#00F0D0] text-[#0B1B32] font-bold py-3 px-6 rounded-full w-full transition-transform active:scale-[0.98]">
                Registrarme gratis
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
