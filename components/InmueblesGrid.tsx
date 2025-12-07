"use client"

import { useState, useMemo } from "react"
import { Heart, Share2, MapPin, Bed, Bath, Car, Maximize, Search, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 12

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
  precio: number
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

interface InmuebleCardProps {
  inmueble: Inmueble
}

function formatPrecio(precio: number, moneda: string): string {
  if (moneda === 'USD') {
    return `$${precio.toLocaleString('en-US')}`
  }
  return `Q${precio.toLocaleString('es-GT')}`
}

function InmuebleCard({ inmueble }: InmuebleCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800"
  const imageUrl = getImageSrc(inmueble.imagen_url) || fallbackImage

  const tipoLabels: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    terreno: 'Terreno',
    oficina: 'Oficina',
    local: 'Local Comercial',
    bodega: 'Bodega',
  }

  return (
    <article
      className="relative group w-full h-[480px] rounded-[2rem] overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer bg-white border border-gray-100"
      itemScope
      itemType="https://schema.org/RealEstateListing"
    >
      <img
        src={imageUrl}
        alt={`Imagen de ${inmueble.titulo} en ${inmueble.ubicacion}`}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-40 pointer-events-none" />

      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
        <div className="flex gap-2 flex-wrap">
          <span className="bg-[#00F0D0] text-[#0B1B32] text-xs font-bold px-4 py-2 rounded-full shadow-sm">
            {tipoLabels[inmueble.tipo] || inmueble.tipo}
          </span>
          {inmueble.destacado && (
            <span className="bg-[#0B1B32] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
              Destacado
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="w-10 h-10 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00dbbe] transition-colors shadow-md active:scale-95"
            aria-label={`Compartir ${inmueble.titulo}`}
          >
            <Share2 size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            className="w-10 h-10 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] hover:bg-[#00dbbe] transition-colors shadow-md active:scale-95"
            aria-label={`Guardar ${inmueble.titulo} en favoritos`}
          >
            <Heart size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-[#0B1B32] p-6 pt-5 pb-6 z-10">
        <h3 className="text-white text-xl font-bold mb-1.5 line-clamp-1" itemProp="name">
          {inmueble.titulo}
        </h3>

        <p className="text-gray-300 text-sm font-medium mb-3 opacity-80 flex items-center gap-1" itemProp="address">
          <MapPin size={14} aria-hidden="true" />
          {inmueble.zona ? `Zona ${inmueble.zona}, ` : ''}{inmueble.ubicacion || inmueble.departamento}
        </p>

        <div className="flex items-center gap-4 mb-3 text-gray-400 text-sm">
          {inmueble.habitaciones > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={16} />
              {inmueble.habitaciones}
            </span>
          )}
          {inmueble.banos > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={16} />
              {inmueble.banos}
            </span>
          )}
          {inmueble.parqueos > 0 && (
            <span className="flex items-center gap-1">
              <Car size={16} />
              {inmueble.parqueos}
            </span>
          )}
          {inmueble.metros_cuadrados > 0 && (
            <span className="flex items-center gap-1">
              <Maximize size={16} />
              {inmueble.metros_cuadrados} m²
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[#00F0D0] font-bold text-xl" itemProp="price">
            {inmueble.operacion === 'alquiler' ? 'Alquiler: ' : 'Desde: '}
            {formatPrecio(inmueble.precio, inmueble.moneda)}
          </div>
          <span className="text-xs text-gray-400 uppercase">
            {inmueble.operacion}
          </span>
        </div>
      </div>
    </article>
  )
}

interface FilterDropdownProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedLabel = options.find(o => o.value === value)?.label || label

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-[#00F0D0] transition-colors min-w-[140px]"
      >
        <span className={`text-sm font-medium ${value ? 'text-[#0B1B32]' : 'text-gray-500'}`}>
          {selectedLabel}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  value === option.value ? 'text-[#00F0D0] font-bold bg-[#00F0D0]/5' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) pages.push('...')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push('...')

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="hidden md:flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:border-[#00F0D0] hover:text-[#00F0D0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {getPageNumbers().map((page, index) => (
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center w-10 h-10 rounded-full font-medium transition-colors ${
              currentPage === page
                ? 'bg-[#00F0D0] text-[#0B1B32]'
                : 'border border-gray-200 text-gray-600 hover:border-[#00F0D0] hover:text-[#00F0D0]'
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2 text-gray-400">...</span>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:border-[#00F0D0] hover:text-[#00F0D0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

interface InmueblesGridProps {
  inmuebles: Inmueble[]
}

export default function InmueblesGrid({ inmuebles }: InmueblesGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [operacionFilter, setOperacionFilter] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileItemsToShow, setMobileItemsToShow] = useState(ITEMS_PER_PAGE)

  const zonas = useMemo(() => {
    const uniqueZonas = [...new Set(inmuebles.map(i => i.zona).filter(Boolean))].sort((a, b) => {
      const numA = parseInt(a) || 999
      const numB = parseInt(b) || 999
      return numA - numB
    })
    return uniqueZonas
  }, [inmuebles])

  const filteredInmuebles = useMemo(() => {
    setCurrentPage(1)
    setMobileItemsToShow(ITEMS_PER_PAGE)

    return inmuebles.filter(inmueble => {
      const matchesSearch = searchQuery === '' ||
        inmueble.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inmueble.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inmueble.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inmueble.zona.includes(searchQuery)

      const matchesTipo = tipoFilter === '' || inmueble.tipo === tipoFilter
      const matchesOperacion = operacionFilter === '' || inmueble.operacion === operacionFilter
      const matchesZona = zonaFilter === '' || inmueble.zona === zonaFilter

      return matchesSearch && matchesTipo && matchesOperacion && matchesZona
    })
  }, [inmuebles, searchQuery, tipoFilter, operacionFilter, zonaFilter])

  const totalPages = Math.ceil(filteredInmuebles.length / ITEMS_PER_PAGE)

  const paginatedInmuebles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInmuebles.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredInmuebles, currentPage])

  const mobileInmuebles = useMemo(() => {
    return filteredInmuebles.slice(0, mobileItemsToShow)
  }, [filteredInmuebles, mobileItemsToShow])

  const hasMoreMobile = mobileItemsToShow < filteredInmuebles.length
  const remainingCount = filteredInmuebles.length - mobileItemsToShow

  const handleLoadMore = () => {
    setMobileItemsToShow(prev => Math.min(prev + ITEMS_PER_PAGE, filteredInmuebles.length))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFiltersCount = [tipoFilter, operacionFilter, zonaFilter].filter(Boolean).length

  const clearAllFilters = () => {
    setSearchQuery('')
    setTipoFilter('')
    setOperacionFilter('')
    setZonaFilter('')
  }

  const tipoOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'casa', label: 'Casa' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'local', label: 'Local Comercial' },
    { value: 'bodega', label: 'Bodega' },
  ]

  const operacionOptions = [
    { value: '', label: 'Todas las operaciones' },
    { value: 'venta', label: 'En Venta' },
    { value: 'alquiler', label: 'En Alquiler' },
  ]

  const zonaOptions = [
    { value: '', label: 'Todas las zonas' },
    ...zonas.map(z => ({ value: z, label: `Zona ${z}` }))
  ]

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredInmuebles.length)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, ubicación o zona..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#0B1B32] placeholder-gray-400 focus:outline-none focus:border-[#00F0D0] focus:ring-2 focus:ring-[#00F0D0]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all md:hidden ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-[#00F0D0] text-[#0B1B32]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal size={18} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-[#0B1B32] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-3">
              <FilterDropdown
                label="Tipo"
                value={tipoFilter}
                options={tipoOptions}
                onChange={setTipoFilter}
              />
              <FilterDropdown
                label="Operación"
                value={operacionFilter}
                options={operacionOptions}
                onChange={setOperacionFilter}
              />
              <FilterDropdown
                label="Zona"
                value={zonaFilter}
                options={zonaOptions}
                onChange={setZonaFilter}
              />

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={16} />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 md:hidden">
              <FilterDropdown
                label="Tipo de propiedad"
                value={tipoFilter}
                options={tipoOptions}
                onChange={setTipoFilter}
              />
              <FilterDropdown
                label="Operación"
                value={operacionFilter}
                options={operacionOptions}
                onChange={setOperacionFilter}
              />
              <FilterDropdown
                label="Zona"
                value={zonaFilter}
                options={zonaOptions}
                onChange={setZonaFilter}
              />

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <X size={16} />
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            <span className="hidden md:inline">
              Mostrando <strong className="text-[#0B1B32]">{startItem}-{endItem}</strong> de {filteredInmuebles.length} propiedades
            </span>
            <span className="md:hidden">
              Mostrando <strong className="text-[#0B1B32]">{mobileInmuebles.length}</strong> de {filteredInmuebles.length} propiedades
            </span>
          </p>

          {activeFiltersCount > 0 && (
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {tipoFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00F0D0]/10 text-[#0B1B32] text-sm font-medium rounded-full">
                  {tipoOptions.find(o => o.value === tipoFilter)?.label}
                  <button onClick={() => setTipoFilter('')} className="hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              )}
              {operacionFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00F0D0]/10 text-[#0B1B32] text-sm font-medium rounded-full">
                  {operacionOptions.find(o => o.value === operacionFilter)?.label}
                  <button onClick={() => setOperacionFilter('')} className="hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              )}
              {zonaFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00F0D0]/10 text-[#0B1B32] text-sm font-medium rounded-full">
                  Zona {zonaFilter}
                  <button onClick={() => setZonaFilter('')} className="hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {filteredInmuebles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron propiedades</h3>
          <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold py-3 px-6 rounded-full transition-all"
          >
            <X size={18} />
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedInmuebles.map((inmueble) => (
              <InmuebleCard key={inmueble.id} inmueble={inmueble} />
            ))}
          </div>

          <div className="md:hidden grid grid-cols-1 gap-6">
            {mobileInmuebles.map((inmueble) => (
              <InmuebleCard key={inmueble.id} inmueble={inmueble} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {hasMoreMobile && (
            <div className="md:hidden flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold py-4 px-8 rounded-full transition-all shadow-lg"
              >
                <ChevronDown size={20} />
                Ver más ({remainingCount} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
