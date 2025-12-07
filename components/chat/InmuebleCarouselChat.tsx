"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Bed, Bath, Car, ChevronLeft, ChevronRight, ExternalLink, Home, Maximize } from "lucide-react"
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

function InmuebleCardFeatured({ inmueble }: { inmueble: InmuebleResult }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = imageError ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800" : getImageSrc(inmueble.imagen_url)

  return (
    <Link
      href={`/inmuebles/${inmueble.id}`}
      target="_blank"
      className="block group w-full"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl border border-[#00F0D0]/20 p-4 sm:p-4 transition-all duration-200 hover:shadow-lg hover:border-[#00F0D0]/40 active:bg-[#00F0D0]/5"
      >
        <div className="flex items-start gap-4 sm:gap-4">
          <div className="relative w-18 h-18 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#00F0D0]/10 to-[#0B1B32]/10 ring-2 ring-[#00F0D0]/20 shadow-md group-hover:ring-[#00F0D0]/40 transition-all flex-shrink-0" style={{ width: '72px', height: '72px' }}>
            <Image
              src={imageUrl}
              alt={inmueble.titulo}
              fill
              sizes="72px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-1 left-1">
              <span className="bg-[#00F0D0] text-[#0B1B32] text-[9px] font-bold px-1.5 py-0.5 rounded">
                {getTipoLabel(inmueble.tipo)}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-[15px] sm:text-sm text-[#0B1B32] group-hover:text-[#00F0D0] transition-colors truncate">
                  {inmueble.titulo}
                </h4>
                <p className="text-[#00F0D0] font-bold text-base sm:text-sm mt-0.5">
                  {formatPrecio(inmueble.precio, inmueble.moneda)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-1 text-sm sm:text-xs text-[#0B1B32] font-medium opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <span>Ver</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              </div>
            </div>

            {(inmueble.zona || inmueble.ubicacion) && (
              <p className="text-sm sm:text-xs text-gray-500 mt-2 sm:mt-1.5 flex items-center gap-1.5 sm:gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 sm:w-3 sm:h-3 flex-shrink-0 text-gray-400" />
                {inmueble.zona ? `Zona ${inmueble.zona}` : inmueble.ubicacion}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2.5 sm:mt-2 flex-wrap">
              {inmueble.habitaciones !== null && inmueble.habitaciones > 0 && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-[10px] bg-[#00F0D0]/10 text-[#0B1B32] px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full font-medium">
                  <Bed className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
                  {inmueble.habitaciones}
                </span>
              )}
              {inmueble.banos !== null && inmueble.banos > 0 && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-[10px] bg-[#00F0D0]/10 text-[#0B1B32] px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full font-medium">
                  <Bath className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
                  {inmueble.banos}
                </span>
              )}
              {inmueble.metros_cuadrados !== null && inmueble.metros_cuadrados > 0 && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full font-medium">
                  <Maximize className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
                  {inmueble.metros_cuadrados}m²
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function InmuebleCardMini({ inmueble }: { inmueble: InmuebleResult }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = imageError ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800" : getImageSrc(inmueble.imagen_url)

  return (
    <Link
      href={`/inmuebles/${inmueble.id}`}
      target="_blank"
      className="block group flex-shrink-0"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-[160px] sm:w-[140px] bg-white rounded-xl border border-[#00F0D0]/20 p-4 sm:p-3 transition-all duration-200 hover:shadow-lg hover:border-[#00F0D0]/40 active:bg-[#00F0D0]/5"
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative w-full h-20 sm:h-16 rounded-lg overflow-hidden mb-2.5 sm:mb-2 bg-gradient-to-br from-[#00F0D0]/10 to-[#0B1B32]/10 shadow-md group-hover:shadow-lg transition-all">
            <Image
              src={imageUrl}
              alt={inmueble.titulo}
              fill
              sizes="160px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-1 left-1">
              <span className="bg-[#00F0D0] text-[#0B1B32] text-[8px] font-bold px-1.5 py-0.5 rounded">
                {getTipoLabel(inmueble.tipo)}
              </span>
            </div>
          </div>

          <h4 className="font-semibold text-sm sm:text-xs text-[#0B1B32] group-hover:text-[#00F0D0] transition-colors line-clamp-1 w-full">
            {inmueble.titulo}
          </h4>

          <p className="text-[#00F0D0] font-bold text-sm sm:text-xs mt-1 sm:mt-0.5">
            {formatPrecio(inmueble.precio, inmueble.moneda)}
          </p>

          {(inmueble.zona || inmueble.ubicacion) && (
            <p className="text-xs sm:text-[10px] text-gray-400 line-clamp-1 mt-1 sm:mt-0.5 flex items-center gap-1 sm:gap-0.5 justify-center">
              <MapPin className="w-3 h-3 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
              <span className="truncate">{inmueble.zona ? `Zona ${inmueble.zona}` : inmueble.ubicacion}</span>
            </p>
          )}

          <div className="flex items-center gap-2 sm:gap-1.5 mt-2.5 sm:mt-2 text-[11px] sm:text-[9px] text-gray-500">
            {inmueble.habitaciones !== null && inmueble.habitaciones > 0 && (
              <span className="bg-[#00F0D0]/10 text-[#0B1B32] px-2 py-0.5 sm:px-1.5 rounded-full font-medium flex items-center gap-0.5">
                <Bed className="w-2.5 h-2.5" />
                {inmueble.habitaciones}
              </span>
            )}
            {inmueble.banos !== null && inmueble.banos > 0 && (
              <span className="bg-[#00F0D0]/10 text-[#0B1B32] px-2 py-0.5 sm:px-1.5 rounded-full font-medium flex items-center gap-0.5">
                <Bath className="w-2.5 h-2.5" />
                {inmueble.banos}
              </span>
            )}
          </div>

          <div className="mt-2.5 sm:mt-2 flex items-center gap-1 text-xs sm:text-[10px] text-[#0B1B32] font-medium sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <span>Ver detalles</span>
            <ExternalLink className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function InmuebleCarouselChat({ inmuebles, searchTerms }: InmuebleCarouselChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = 160
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
    setTimeout(checkScroll, 300)
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
      <div className="bg-gradient-to-br from-[#00F0D0]/5 to-[#0B1B32]/5 rounded-xl border border-[#00F0D0]/20 p-4 sm:p-3 shadow-sm">
        <div className="flex items-center justify-between mb-3 sm:mb-2">
          <div className="flex items-center gap-2.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm sm:text-xs font-medium text-gray-600">
              {inmuebles.length === 1
                ? "Encontré esta propiedad para ti"
                : `${inmuebles.length} propiedades encontradas`}
            </span>
          </div>

          {!isFewInmuebles && (
            <div className="flex items-center gap-1.5 sm:gap-1">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="h-8 w-8 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-white border border-[#00F0D0]/20 text-[#0B1B32] hover:bg-[#00F0D0]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:bg-[#00F0D0]/20"
              >
                <ChevronLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="h-8 w-8 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-white border border-[#00F0D0]/20 text-[#0B1B32] hover:bg-[#00F0D0]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:bg-[#00F0D0]/20"
              >
                <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>

        {isFewInmuebles ? (
          <div className="space-y-3 sm:space-y-2">
            {inmuebles.map((inmueble, index) => (
              <motion.div
                key={inmueble.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <InmuebleCardFeatured inmueble={inmueble} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-3 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {inmuebles.map((inmueble, index) => (
              <motion.div
                key={inmueble.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <InmuebleCardMini inmueble={inmueble} />
              </motion.div>
            ))}
          </div>
        )}

        {searchTerms && searchTerms.length > 0 && (
          <div className="mt-3 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-1">
            {searchTerms.map((term, i) => (
              <span
                key={i}
                className="text-xs sm:text-[9px] px-2 py-0.5 sm:px-1.5 bg-[#00F0D0]/10 text-[#0B1B32] rounded-full"
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
