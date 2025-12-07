"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Bed, Bath, ChevronLeft, ChevronRight, Heart, Share2, Maximize } from "lucide-react"
import type { InmuebleResult } from "@/hooks/useChatManager"

interface InmuebleCarouselChatProps {
  inmuebles: InmuebleResult[]
  searchTerms?: string[]
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

function getTipoLabel(tipo: string): string {
  const tipos: Record<string, string> = {
    apartamento: "Apartamento",
    casa: "Casa",
    terreno: "Terreno",
    oficina: "Oficina",
    local: "Local",
    bodega: "Bodega",
  }
  return tipos[tipo] || tipo
}

function getOperacionLabel(operacion: string): string {
  return operacion === "alquiler" ? "En Alquiler" : "En Venta"
}

function InmuebleCardLarge({ inmueble, index }: { inmueble: InmuebleResult; index: number }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = imageError ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800" : getImageSrc(inmueble.imagen_url)

  const location = inmueble.zona
    ? `Zona ${inmueble.zona}, ${inmueble.departamento || 'Guatemala'}`
    : inmueble.ubicacion || inmueble.departamento || 'Guatemala'

  return (
    <Link href={`/inmuebles/${inmueble.id}`} target="_blank" className="block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        className="relative group w-full h-[320px] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer bg-white border border-gray-100"
      >
        <Image
          src={imageUrl}
          alt={inmueble.titulo}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImageError(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-32 pointer-events-none" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            <span className="bg-[#00F0D0] text-[#0B1B32] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {getTipoLabel(inmueble.tipo)}
            </span>
            <span className="bg-white/95 backdrop-blur-sm text-[#0B1B32] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {getOperacionLabel(inmueble.operacion)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00dbbe] transition-colors shadow-md active:scale-95"
              aria-label="Compartir"
            >
              <Share2 size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00dbbe] transition-colors shadow-md active:scale-95"
              aria-label="Favorito"
            >
              <Heart size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0B1B32] via-[#0B1B32]/95 to-transparent pt-12 pb-5 px-5">
          <h3 className="text-white text-lg font-bold mb-1.5 line-clamp-1">{inmueble.titulo}</h3>

          <p className="text-gray-300 text-sm font-medium mb-2.5 flex items-center gap-1.5">
            <MapPin size={14} className="text-[#00F0D0]" />
            {location}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-[#00F0D0] font-bold text-xl">
              {formatPrecio(inmueble.precio, inmueble.moneda)}
            </div>

            <div className="flex items-center gap-3 text-white/80 text-sm">
              {inmueble.habitaciones !== null && inmueble.habitaciones > 0 && (
                <span className="flex items-center gap-1">
                  <Bed size={14} />
                  {inmueble.habitaciones}
                </span>
              )}
              {inmueble.banos !== null && inmueble.banos > 0 && (
                <span className="flex items-center gap-1">
                  <Bath size={14} />
                  {inmueble.banos}
                </span>
              )}
              {inmueble.metros_cuadrados !== null && inmueble.metros_cuadrados > 0 && (
                <span className="flex items-center gap-1">
                  <Maximize size={14} />
                  {inmueble.metros_cuadrados}m²
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

function InmuebleCardCarousel({ inmueble, index }: { inmueble: InmuebleResult; index: number }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = imageError ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800" : getImageSrc(inmueble.imagen_url)

  const location = inmueble.zona
    ? `Zona ${inmueble.zona}`
    : inmueble.ubicacion?.split(',')[0] || 'Guatemala'

  return (
    <Link href={`/inmuebles/${inmueble.id}`} target="_blank" className="block flex-shrink-0">
      <motion.article
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group w-[220px] h-[280px] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer bg-white border border-gray-100"
      >
        <Image
          src={imageUrl}
          alt={inmueble.titulo}
          fill
          sizes="220px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImageError(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent h-20 pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <span className="bg-[#00F0D0] text-[#0B1B32] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {getTipoLabel(inmueble.tipo)}
          </span>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00F0D0] transition-colors shadow-md active:scale-95"
            aria-label="Favorito"
          >
            <Heart size={13} strokeWidth={2.5} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0B1B32] via-[#0B1B32]/90 to-transparent pt-10 pb-4 px-4">
          <h3 className="text-white text-sm font-bold mb-1 line-clamp-1">{inmueble.titulo}</h3>

          <p className="text-gray-300 text-xs mb-2 flex items-center gap-1">
            <MapPin size={11} className="text-[#00F0D0]" />
            {location}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-[#00F0D0] font-bold text-base">
              {formatPrecio(inmueble.precio, inmueble.moneda)}
            </div>

            <div className="flex items-center gap-2 text-white/70 text-xs">
              {inmueble.habitaciones !== null && inmueble.habitaciones > 0 && (
                <span className="flex items-center gap-0.5">
                  <Bed size={11} />
                  {inmueble.habitaciones}
                </span>
              )}
              {inmueble.banos !== null && inmueble.banos > 0 && (
                <span className="flex items-center gap-0.5">
                  <Bath size={11} />
                  {inmueble.banos}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

export default function InmuebleCarouselChat({ inmuebles, searchTerms }: InmuebleCarouselChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft: sl, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(sl > 10)
    setCanScrollRight(sl < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = 240
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
    setTimeout(checkScroll, 300)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    scrollRef.current.style.cursor = "grabbing"
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(walk) > 5) {
      setHasDragged(true)
    }
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab"
    }
    checkScroll()
    setTimeout(() => setHasDragged(false), 100)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      if (scrollRef.current) {
        scrollRef.current.style.cursor = "grab"
      }
      checkScroll()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(walk) > 5) {
      setHasDragged(true)
    }
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    checkScroll()
    setTimeout(() => setHasDragged(false), 100)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (!inmuebles || inmuebles.length === 0) return null

  const isFewInmuebles = inmuebles.length <= 2

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full"
    >
      <div className="bg-gradient-to-br from-[#00F0D0]/5 to-[#0B1B32]/5 rounded-2xl border border-[#00F0D0]/20 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-[#0B1B32]">
              {inmuebles.length === 1
                ? "Encontré esta propiedad para ti"
                : `${inmuebles.length} propiedades encontradas`}
            </span>
          </div>

          {!isFewInmuebles && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-[#00F0D0]/30 text-[#0B1B32] hover:bg-[#00F0D0]/10 hover:border-[#00F0D0] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-[#00F0D0]/30 text-[#0B1B32] hover:bg-[#00F0D0]/10 hover:border-[#00F0D0] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isFewInmuebles ? (
          <div className="space-y-4">
            {inmuebles.map((inmueble, index) => (
              <InmuebleCardLarge key={inmueble.id} inmueble={inmueble} index={index} />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClickCapture={handleCardClick}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 cursor-grab select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {inmuebles.map((inmueble, index) => (
              <InmuebleCardCarousel key={inmueble.id} inmueble={inmueble} index={index} />
            ))}
          </div>
        )}

        {searchTerms && searchTerms.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#00F0D0]/10 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Filtros aplicados:</span>
            {searchTerms.map((term, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 bg-[#00F0D0]/15 text-[#0B1B32] rounded-full font-medium"
              >
                {term}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
