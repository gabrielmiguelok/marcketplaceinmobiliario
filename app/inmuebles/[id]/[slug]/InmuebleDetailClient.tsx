"use client"

import { useState } from "react"
import { Share2, Heart, Check } from "lucide-react"
import toast from "react-hot-toast"
import { generateInmuebleUrl } from "@/lib/utils"

interface Props {
  id: number
  imageUrl: string
  titulo: string
  tipo: string
  tipoLabel: string
  operacion: string
  destacado: boolean
}

export default function InmuebleDetailClient({
  id,
  imageUrl,
  titulo,
  tipo,
  tipoLabel,
  operacion,
  destacado
}: Props) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}${generateInmuebleUrl(id, titulo)}`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Enlace copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar el enlace")
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    toast.success(liked ? "Removido de favoritos" : "Agregado a favoritos")
  }

  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl">
      <img
        src={imageUrl}
        alt={titulo}
        className="w-full h-full object-cover"
      />

      <div className="absolute top-5 left-5 flex gap-2 flex-wrap">
        <span className="bg-[#00F0D0] text-[#0B1B32] text-sm font-bold px-4 py-2 rounded-full shadow-lg">
          {tipoLabel}
        </span>
        <span className="bg-white/90 backdrop-blur-sm text-[#0B1B32] text-sm font-bold px-4 py-2 rounded-full shadow-lg uppercase">
          {operacion}
        </span>
        {destacado && (
          <span className="bg-[#0B1B32] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            Destacado
          </span>
        )}
      </div>

      <div className="absolute top-5 right-5 flex gap-2">
        <button
          onClick={handleShare}
          className="w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00F0D0] transition-colors shadow-lg"
          aria-label="Compartir"
        >
          {copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} />}
        </button>
        <button
          onClick={handleLike}
          className={`w-11 h-11 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg ${
            liked ? "bg-red-500 text-white" : "bg-white/90 text-[#0B1B32] hover:bg-[#00F0D0]"
          }`}
          aria-label="Guardar en favoritos"
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  )
}
