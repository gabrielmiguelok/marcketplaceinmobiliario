'use client'

import { useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Share2, MapPin, Bed, Bath, Car, Maximize, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateInmuebleUrl } from '@/lib/utils'
import { useCurrency } from '@/lib/currency-context'

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

interface Inmueble {
  id: number
  titulo: string
  descripcion: string
  tipo: 'apartamento' | 'casa' | 'terreno' | 'oficina' | 'local' | 'bodega'
  operacion: 'venta' | 'alquiler'
  precio_usd: number
  precio_gtq: number
  moneda: 'USD' | 'GTQ'
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
  latitud?: number
  longitud?: number
}

interface InmuebleCardMapProps {
  inmueble: Inmueble
  isSelected?: boolean
  isHovered?: boolean
  onHover?: (id: number | null) => void
  onClick?: (id: number, titulo: string) => void
}

const tipoLabels: Record<string, string> = {
  apartamento: 'Apto',
  casa: 'Casa',
  terreno: 'Terreno',
  oficina: 'Oficina',
  local: 'Local',
  bodega: 'Bodega',
}

function InmuebleCardMapComponent({
  inmueble,
  isSelected = false,
  isHovered = false,
  onHover,
  onClick,
}: InmuebleCardMapProps) {
  const router = useRouter()
  const { formatPriceCompact } = useCurrency()
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)

  const fallbackImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400"
  const imageUrl = getImageSrc(inmueble.imagen_url) || fallbackImage

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}${generateInmuebleUrl(inmueble.id, inmueble.titulo)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Enlace copiado")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    toast.success(liked ? "Removido de favoritos" : "Agregado a favoritos")
  }

  const handleClick = () => {
    if (onClick) {
      onClick(inmueble.id, inmueble.titulo)
    } else {
      router.push(generateInmuebleUrl(inmueble.id, inmueble.titulo))
    }
  }

  return (
    <article
      className={`
        group relative overflow-hidden rounded-2xl bg-white border-2 transition-all duration-300 cursor-pointer
        hover:shadow-xl hover:-translate-y-1
        ${isSelected ? 'border-[#00F0D0] shadow-lg shadow-[#00F0D0]/20 ring-2 ring-[#00F0D0]/30' :
          isHovered ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-gray-100 shadow-md'}
      `}
      onClick={handleClick}
      onMouseEnter={() => onHover?.(inmueble.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imageUrl}
          alt={inmueble.titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <div className="flex gap-1.5">
            <span className="bg-[#00F0D0] text-[#0B1B32] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {tipoLabels[inmueble.tipo] || inmueble.tipo}
            </span>
            {inmueble.destacado && (
              <span className="bg-[#0B1B32] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                ⭐
              </span>
            )}
          </div>

          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleShare}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-md ${
                copied ? 'bg-green-500 text-white' : 'bg-white/90 text-[#0B1B32] hover:bg-white'
              }`}
            >
              {copied ? <Check size={12} /> : <Share2 size={12} />}
            </button>
            <button
              onClick={handleLike}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-md ${
                liked ? 'bg-red-500 text-white' : 'bg-white/90 text-[#0B1B32] hover:bg-white'
              }`}
            >
              <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
          <span className="text-white font-bold text-lg drop-shadow-lg">
            {formatPriceCompact(inmueble.precio_usd, inmueble.precio_gtq)}
          </span>
          <span className="text-[10px] text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {inmueble.operacion === 'alquiler' ? 'Alquiler' : 'Venta'}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-[#0B1B32] text-sm leading-tight line-clamp-1 mb-1">
          {inmueble.titulo}
        </h3>

        <p className="text-gray-500 text-[11px] flex items-center gap-1 mb-2">
          <MapPin size={10} />
          <span className="truncate">
            {inmueble.zona ? `Z${inmueble.zona}` : ''} {inmueble.ubicacion || inmueble.departamento}
          </span>
        </p>

        <div className="flex items-center gap-3 text-gray-400 text-[11px]">
          {inmueble.habitaciones > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={12} />
              {inmueble.habitaciones}
            </span>
          )}
          {inmueble.banos > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={12} />
              {inmueble.banos}
            </span>
          )}
          {inmueble.metros_cuadrados > 0 && (
            <span className="flex items-center gap-1">
              <Maximize size={12} />
              {inmueble.metros_cuadrados}m²
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default memo(InmuebleCardMapComponent)
