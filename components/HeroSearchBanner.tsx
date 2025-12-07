"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Check, Search, MapPin, Bed, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

interface FilterOption {
  value: string
  label: string
  subLabel?: string | null
  count?: number
}

interface FiltersData {
  zonas: FilterOption[]
  tipos: FilterOption[]
  operaciones: FilterOption[]
  habitaciones: FilterOption[]
  rangosPrecios: { value: string; label: string; min: number; max: number | null; count?: number }[]
  sinHabitaciones: number
}

interface SearchResult {
  id: number
  titulo: string
  tipo: string
  operacion: string
  precio: number
  moneda: string
  ubicacion: string
  zona: string
  habitaciones: number
  banos: number
  metros_cuadrados: number
  imagen_url: string | null
}

interface SearchFilterItemProps {
  label: string
  value: string
  displayValue: string
  isOpen: boolean
  onToggle: () => void
  options: FilterOption[]
  onSelect: (value: string) => void
  hasSeparator?: boolean
  loading?: boolean
  updating?: boolean
}

function SearchFilterItem({
  label,
  value,
  displayValue,
  isOpen,
  onToggle,
  options,
  onSelect,
  hasSeparator,
  loading,
  updating
}: SearchFilterItemProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-center px-4 py-3 cursor-pointer w-full transition-all duration-300 group",
        "hover:bg-gray-50/80",
        hasSeparator && "lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:h-12 lg:after:w-[1px] lg:after:bg-gray-200",
        "border-b border-gray-100 lg:border-none"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 select-none flex items-center gap-1 transition-colors group-hover:text-[#00F0D0]">
        {label}
        {updating && <Loader2 size={10} className="animate-spin text-[#00F0D0]" />}
      </span>

      <div className="flex items-center justify-between text-[#0B1B32]">
        <span className={cn(
          "font-bold text-[14px] md:text-[15px] truncate select-none leading-tight",
          updating && "opacity-60"
        )}>
          {loading ? "Cargando..." : displayValue}
        </span>
        <div className={cn(
          "transition-transform duration-300 text-gray-400 group-hover:text-[#00F0D0]",
          isOpen && "rotate-180 text-[#00F0D0]"
        )}>
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ChevronDown size={20} strokeWidth={2.5} />
          )}
        </div>
      </div>

      <div className={cn(
        "absolute bottom-full mb-2 left-0 w-full min-w-[240px] bg-white rounded-2xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15),0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-50",
        "transform transition-all duration-200 origin-bottom",
        isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 translate-y-2 invisible pointer-events-none"
      )}>
        <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto">
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 hover:bg-[#F0FDFA] rounded-xl transition-colors cursor-pointer group/item",
              !value && "bg-[#F0FDFA]"
            )}
            onClick={(e) => {
              e.stopPropagation()
              onSelect("")
            }}
          >
            <div>
              <div className="font-bold text-[#0B1B32] text-sm group-hover/item:text-[#00F0D0] transition-colors">
                Todos
              </div>
            </div>
            {!value && <Check size={16} className="text-[#00F0D0]" />}
          </div>

          {options.length === 0 ? (
            <div className="px-4 py-3 text-gray-400 text-sm text-center">
              Sin opciones disponibles
            </div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  "flex items-center justify-between px-4 py-3 hover:bg-[#F0FDFA] rounded-xl transition-colors cursor-pointer group/item",
                  value === opt.value && "bg-[#F0FDFA]"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(opt.value)
                }}
              >
                <div>
                  <div className="font-bold text-[#0B1B32] text-sm group-hover/item:text-[#00F0D0] transition-colors">
                    {opt.label}
                    {opt.count !== undefined && (
                      <span className="text-gray-400 font-normal ml-1">({opt.count})</span>
                    )}
                  </div>
                  {opt.subLabel && <div className="text-xs text-gray-400 mt-0.5">{opt.subLabel}</div>}
                </div>
                {value === opt.value && <Check size={16} className="text-[#00F0D0]" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
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

function formatPrecio(precio: number, moneda: string): string {
  if (moneda === 'USD') {
    return `$${precio.toLocaleString('en-US')}`
  }
  return `Q${precio.toLocaleString('es-GT')}`
}

interface ResultCardProps {
  inmueble: SearchResult
  onClick: () => void
  isDragging: boolean
}

function ResultCard({ inmueble, onClick, isDragging }: ResultCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400"
  const imageUrl = getImageSrc(inmueble.imagen_url) || fallbackImage

  const tipoLabels: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    terreno: 'Terreno',
    oficina: 'Oficina',
    local: 'Local',
    bodega: 'Bodega',
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick()
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group flex-shrink-0 w-[160px] md:w-[220px] select-none"
      onClick={handleClick}
    >
      <div className="relative h-28 md:h-36 overflow-hidden">
        <img
          src={imageUrl}
          alt={inmueble.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage }}
          draggable={false}
        />
        <div className="absolute top-2 left-2">
          <span className="bg-[#00F0D0] text-[#0B1B32] text-[10px] font-bold px-2 py-1 rounded-full">
            {tipoLabels[inmueble.tipo] || inmueble.tipo}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h4 className="font-bold text-[#0B1B32] text-sm truncate group-hover:text-[#00F0D0] transition-colors">
          {inmueble.titulo}
        </h4>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <MapPin size={12} />
          {inmueble.zona ? `Zona ${inmueble.zona}` : inmueble.ubicacion}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-[#00F0D0]">
            {formatPrecio(inmueble.precio, inmueble.moneda)}
          </span>
          {inmueble.habitaciones > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Bed size={12} />
              {inmueble.habitaciones}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HeroSearchBanner() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState<FiltersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingFilters, setUpdatingFilters] = useState(false)
  const [searching, setSearching] = useState(false)
  const [totalDisponibles, setTotalDisponibles] = useState(0)

  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const [zona, setZona] = useState("")
  const [habitaciones, setHabitaciones] = useState("")
  const [rangoPrecio, setRangoPrecio] = useState("")

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  const fetchFilters = useCallback(async (currentZona: string, currentHabitaciones: string, currentRangoPrecio: string, isInitial = false) => {
    if (!isInitial) {
      setUpdatingFilters(true)
    }

    try {
      const params = new URLSearchParams()
      if (currentZona) params.set("zona", currentZona)
      if (currentHabitaciones) params.set("habitaciones", currentHabitaciones)
      if (currentRangoPrecio) {
        const [min, max] = currentRangoPrecio.split("-")
        if (min) params.set("precio_min", min)
        if (max) params.set("precio_max", max)
      }

      const res = await fetch(`/api/search-filters?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setFilters(data.filters)
        setTotalDisponibles(data.totalDisponibles)
      }
    } catch (error) {
      console.error("Error cargando filtros:", error)
    } finally {
      if (isInitial) {
        setLoading(false)
      } else {
        setUpdatingFilters(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchFilters("", "", "", true)
  }, [fetchFilters])

  useEffect(() => {
    if (!loading) {
      fetchFilters(zona, habitaciones, rangoPrecio)
    }
  }, [zona, habitaciones, rangoPrecio, loading, fetchFilters])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
    carouselRef.current.style.cursor = 'grabbing'
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab'
    }
    setTimeout(() => setHasDragged(false), 100)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(walk) > 5) {
      setHasDragged(true)
    }
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      if (carouselRef.current) {
        carouselRef.current.style.cursor = 'grab'
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(walk) > 5) {
      setHasDragged(true)
    }
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTimeout(() => setHasDragged(false), 100)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const scrollAmount = carouselRef.current.clientWidth * 0.8
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const handleSearch = useCallback(async () => {
    if (totalDisponibles === 0) return

    setSearching(true)
    setShowResults(true)
    setOpenFilter(null)

    try {
      const params = new URLSearchParams()
      if (zona) params.set("zona", zona)
      if (habitaciones) params.set("habitaciones", habitaciones)
      if (rangoPrecio) {
        const [min, max] = rangoPrecio.split("-")
        if (min) params.set("precio_min", min)
        if (max) params.set("precio_max", max)
      }
      params.set("limit", "24")

      const res = await fetch(`/api/inmuebles/search?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setResults(data.inmuebles)
      }
    } catch (error) {
      console.error("Error en búsqueda:", error)
    } finally {
      setSearching(false)
    }
  }, [zona, habitaciones, rangoPrecio, totalDisponibles])

  const handleViewAll = () => {
    const params = new URLSearchParams()
    if (zona) params.set("zona", zona)
    if (habitaciones) params.set("habitaciones", habitaciones)
    if (rangoPrecio) {
      const [min, max] = rangoPrecio.split("-")
      if (min) params.set("precio_min", min)
      if (max) params.set("precio_max", max)
    }

    const queryString = params.toString()
    router.push(`/inmuebles${queryString ? `?${queryString}` : ""}`)
  }

  const handleResultClick = (id: number) => {
    if (hasDragged) return
    router.push(`/inmuebles/${id}`)
  }

  const handleClose = () => {
    setShowResults(false)
    setResults([])
  }

  const getZonaDisplay = () => {
    if (!zona) return "Todas las zonas"
    const found = filters?.zonas.find(z => z.value === zona)
    return found ? found.label : `Zona ${zona}`
  }

  const getHabitacionesDisplay = () => {
    if (!habitaciones) return "Cualquiera"
    if (habitaciones === "0") return "Otros"
    const found = filters?.habitaciones.find(h => h.value === habitaciones)
    return found ? found.label : `${habitaciones} hab`
  }

  const getPrecioDisplay = () => {
    if (!rangoPrecio) return "Cualquier precio"
    const found = filters?.rangosPrecios.find(r => r.value === rangoPrecio)
    return found ? found.label : rangoPrecio
  }

  const getHabitacionesOptions = (): FilterOption[] => {
    const options = filters?.habitaciones || []
    if (filters?.sinHabitaciones && filters.sinHabitaciones > 0) {
      return [
        ...options,
        {
          value: "0",
          label: "Otros",
          subLabel: "Terrenos, locales, bodegas...",
          count: filters.sinHabitaciones
        }
      ]
    }
    return options
  }

  const handleZonaSelect = (val: string) => {
    setZona(val)
    if (val && filters?.zonas.find(z => z.value === val) === undefined) {
      setZona("")
    }
    setOpenFilter(null)
  }

  const handleHabitacionesSelect = (val: string) => {
    setHabitaciones(val)
    setOpenFilter(null)
  }

  const handlePrecioSelect = (val: string) => {
    setRangoPrecio(val)
    setOpenFilter(null)
  }

  const hasActiveFilters = zona || habitaciones || rangoPrecio

  return (
    <div ref={containerRef} className="w-full max-w-[360px] lg:max-w-[1100px] flex flex-col items-center gap-4">
      <div className="bg-white rounded-[2rem] p-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-[360px] lg:max-w-[900px] flex flex-col lg:flex-row items-stretch lg:items-center animate-in fade-in zoom-in-95 duration-700 backdrop-blur-sm border border-white/80">
        <div className="flex-1 w-full">
          <SearchFilterItem
            label="Ubicación"
            value={zona}
            displayValue={getZonaDisplay()}
            isOpen={openFilter === "location"}
            onToggle={() => setOpenFilter(openFilter === "location" ? null : "location")}
            hasSeparator={true}
            options={filters?.zonas || []}
            onSelect={handleZonaSelect}
            loading={loading}
            updating={updatingFilters}
          />
        </div>

        <div className="flex-1 w-full">
          <SearchFilterItem
            label="Número de habitaciones"
            value={habitaciones}
            displayValue={getHabitacionesDisplay()}
            isOpen={openFilter === "rooms"}
            onToggle={() => setOpenFilter(openFilter === "rooms" ? null : "rooms")}
            hasSeparator={true}
            options={getHabitacionesOptions()}
            onSelect={handleHabitacionesSelect}
            loading={loading}
            updating={updatingFilters}
          />
        </div>

        <div className="flex-1 w-full">
          <SearchFilterItem
            label="Rango de precio"
            value={rangoPrecio}
            displayValue={getPrecioDisplay()}
            isOpen={openFilter === "price"}
            onToggle={() => setOpenFilter(openFilter === "price" ? null : "price")}
            hasSeparator={false}
            options={filters?.rangosPrecios.map(r => ({ value: r.value, label: r.label, count: r.count })) || []}
            onSelect={handlePrecioSelect}
            loading={loading}
            updating={updatingFilters}
          />
        </div>

        <div className="mt-2 lg:mt-0 lg:pl-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || totalDisponibles === 0}
            className={cn(
              "w-full lg:w-auto font-extrabold text-[14px] py-3 px-6 rounded-[1.5rem] transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2",
              totalDisponibles === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] shadow-[0_10px_30px_-5px_rgba(0,240,208,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(0,240,208,0.5)] hover:scale-[1.02] active:scale-[0.98]",
              "disabled:opacity-70"
            )}
            aria-label="Buscar propiedades con los filtros seleccionados"
          >
            {searching ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            {totalDisponibles === 0 ? "Sin resultados" : `Buscar (${totalDisponibles})`}
          </button>
        </div>
      </div>

      {hasActiveFilters && !showResults && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/80">
            {totalDisponibles === 0 ? (
              <span className="text-red-300">No hay propiedades con estos filtros</span>
            ) : (
              <span>{totalDisponibles} propiedades disponibles</span>
            )}
          </span>
          <button
            onClick={() => {
              setZona("")
              setHabitaciones("")
              setRangoPrecio("")
            }}
            className="text-[#00F0D0] hover:underline font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {showResults && (
        <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/80 p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={40} className="animate-spin text-[#00F0D0]" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium text-lg">No se encontraron propiedades</p>
              <p className="text-sm text-gray-400 mt-2">Intenta ajustar los filtros de búsqueda</p>
              <button
                onClick={handleClose}
                className="mt-4 text-[#00F0D0] font-medium hover:underline"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    <strong className="text-[#0B1B32] text-lg">{results.length}</strong> propiedades encontradas
                  </span>
                  <span className="text-xs text-gray-400 hidden md:inline">
                    Arrastra para ver más →
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00F0D0] transition-colors hidden md:flex"
                >
                  <ChevronLeft size={24} />
                </button>

                <div
                  ref={carouselRef}
                  className={cn(
                    "flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2",
                    "scroll-smooth snap-x snap-mandatory",
                    "cursor-grab active:cursor-grabbing"
                  )}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {results.map((inmueble) => (
                    <div key={inmueble.id} className="snap-start flex-shrink-0">
                      <ResultCard
                        inmueble={inmueble}
                        onClick={() => handleResultClick(inmueble.id)}
                        isDragging={hasDragged}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollCarousel('right')}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00F0D0] transition-colors hidden md:flex"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200">
                <button
                  onClick={handleViewAll}
                  className="w-full bg-[#0B1B32] hover:bg-[#0B1B32]/90 text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Ver todas las propiedades
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
