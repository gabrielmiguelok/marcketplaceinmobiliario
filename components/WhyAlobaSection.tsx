"use client"

import { useState, useEffect, useRef } from "react"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

interface CardData {
  id: number
  title: string
  description: string
  bgColor: string
  badgeColor: string
  heightMobile: string
  heightDesktop: string
}

const CARDS: CardData[] = [
  {
    id: 1,
    title: "Mapa interactivo",
    description: "Explora proyectos en la ciudad con nuestra búsqueda geográfica avanzada.",
    bgColor: "bg-[#F3F4F6]",
    badgeColor: "bg-[#00F0D0]",
    heightMobile: "h-[140px]",
    heightDesktop: "md:h-[312px]"
  },
  {
    id: 2,
    title: "Conexión directa",
    description: "Habla directamente con los desarrolladores y resuelve tus dudas sin intermediarios.",
    bgColor: "bg-[#D1FAE5]",
    badgeColor: "bg-[#F3F4F6]",
    heightMobile: "h-[160px]",
    heightDesktop: "md:h-[396px]"
  },
  {
    id: 3,
    title: "Todo en un lugar",
    description: "Información clara, segura y ordenada para que tomes decisiones con confianza.",
    bgColor: "bg-[#00F0D0]",
    badgeColor: "bg-white",
    heightMobile: "h-[180px]",
    heightDesktop: "md:h-[480px]"
  }
]

export default function WhyAlobaSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setExpandedCard(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCardClick = (cardId: number) => {
    if (window.innerWidth < 768) {
      setExpandedCard(expandedCard === cardId ? null : cardId)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, cardId: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleCardClick(cardId)
    }
  }

  return (
    <section className="w-full py-8 md:py-20 bg-white" role="region" aria-label="Por qué elegir Aloba">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Bloque de Texto */}
        <div className="max-w-[600px]">
          <div className="inline-block px-4 py-1.5 md:px-6 md:py-2.5 rounded-full border border-[#0B1B32] text-[#0B1B32] font-bold text-xs md:text-base mb-4 md:mb-6 bg-white">
            La pregunta del millón...
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0B1B32] mb-3 md:mb-5 leading-[1.1]">
            ¿Por qué explorar en aloba?
          </h2>

          <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-[#0B1B32] font-medium leading-relaxed opacity-80">
            La forma más clara y confiable de explorar el mercado inmobiliario en Guatemala, con todo lo que necesitas para decidir mejor.
          </p>
        </div>

        {/* Bloque de Tarjetas */}
        <div className="flex justify-center md:justify-end mt-6 md:-mt-12 lg:-mt-16">
          <div ref={sectionRef} className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 items-end w-full md:w-auto" style={{ maxWidth: "984px" }}>

            {CARDS.map((card) => {
              const isExpanded = expandedCard === card.id

              return (
                <article
                  key={card.id}
                  role="button"
                  aria-expanded={isExpanded}
                  aria-label={`${card.title}: ${card.description}`}
                  tabIndex={0}
                  onClick={() => handleCardClick(card.id)}
                  onKeyDown={(e) => handleKeyDown(e, card.id)}
                  className={cn(
                    card.bgColor,
                    "rounded-xl md:rounded-[2rem] p-3 md:p-8 flex flex-col justify-between relative group md:hover:shadow-xl transition-all duration-300 cursor-pointer md:cursor-default",
                    isExpanded ? "h-[280px] z-20 shadow-2xl scale-105" : cn(card.heightMobile, card.heightDesktop)
                  )}
                >
                  <div>
                    <h3 className={cn(
                      "font-bold text-[#0B1B32] mb-1 md:mb-2 leading-tight",
                      isExpanded ? "text-base" : "text-xs sm:text-sm md:text-xl"
                    )}>
                      {card.title}
                    </h3>
                    <p className={cn(
                      "text-[#0B1B32]/70 leading-snug font-medium",
                      isExpanded ? "text-sm" : "text-[10px] sm:text-xs md:text-base",
                      !isExpanded && "line-clamp-3 md:line-clamp-none"
                    )}>
                      {card.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      card.badgeColor,
                      "absolute rounded-full flex items-center justify-center text-[#0B1B32] font-bold shadow-sm",
                      isExpanded ? "bottom-3 right-3 w-8 h-8 text-sm" : "bottom-2 right-2 md:bottom-5 md:right-5 w-6 h-6 md:w-10 md:h-10 text-xs md:text-lg"
                    )}
                    aria-hidden="true"
                  >
                    {card.id}
                  </div>
                </article>
              )
            })}

          </div>
        </div>

        {/* Indicador táctil en mobile */}
        <small className="block text-center text-xs text-gray-400 mt-4 md:hidden" role="note">
          Toca una tarjeta para expandirla
        </small>
      </div>
    </section>
  )
}
