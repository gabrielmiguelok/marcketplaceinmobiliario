'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import InmuebleCardMap from '@/components/map/InmuebleCardMap'
import { ChevronLeft, ChevronRight, MapPin, Loader2, X, ChevronDown, SlidersHorizontal } from 'lucide-react'

const PropertyMapAloba = dynamic(() => import('@/components/map/PropertyMapAloba'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#00F0D0] animate-spin" />
        <span className="text-gray-500 text-sm">Cargando mapa...</span>
      </div>
    </div>
  ),
})

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

const ITEMS_PER_PAGE = 6

interface FilterDropdownProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  compact?: boolean
}

function FilterDropdown({ label, value, options, onChange, compact }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedLabel = options.find(o => o.value === value)?.label || label

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg hover:border-[#00F0D0] transition-colors ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
        } ${value ? 'border-[#00F0D0] bg-[#00F0D0]/5' : ''}`}
      >
        <span className={`font-medium ${value ? 'text-[#0B1B32]' : 'text-gray-500'}`}>
          {selectedLabel}
        </span>
        <ChevronDown size={compact ? 12 : 14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[1100]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full min-w-[140px] bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[1200] max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
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

export default function MapaInmueblesPage() {
  const router = useRouter()
  const gridRef = useRef<HTMLDivElement>(null)
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  const [tipoFilter, setTipoFilter] = useState('')
  const [operacionFilter, setOperacionFilter] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [precioMaxFilter, setPrecioMaxFilter] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const fetchInmuebles = async () => {
      try {
        const response = await fetch('/api/inmuebles')
        const data = await response.json()
        if (data.success) {
          setInmuebles(data.inmuebles)
        }
      } catch (error) {
        console.error('Error fetching inmuebles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInmuebles()
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSelectionChange = useCallback((ids: number[]) => {
    setSelectedIds(ids)
    setCurrentPage(1)
  }, [])

  const handlePropertyHover = useCallback((id: number | null) => {
    setHoveredPropertyId(id)
  }, [])

  const handleMarkerHover = useCallback((id: number | null) => {
    setHoveredPropertyId(id)
  }, [])

  const handleViewProperty = useCallback((id: number) => {
    router.push(`/inmuebles/${id}`)
  }, [router])

  const handleMobileCardClick = useCallback((id: number) => {
    if (selectedPropertyId === id) {
      router.push(`/inmuebles/${id}`)
    } else {
      setSelectedPropertyId(id)
    }
  }, [selectedPropertyId, router])

  const zonas = useMemo(() => {
    const uniqueZonas = [...new Set(inmuebles.map(i => i.zona).filter(Boolean))].sort((a, b) => {
      const numA = parseInt(a) || 999
      const numB = parseInt(b) || 999
      return numA - numB
    })
    return uniqueZonas
  }, [inmuebles])

  const tipoOptions = [
    { value: '', label: 'Tipo' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'casa', label: 'Casa' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'local', label: 'Local' },
    { value: 'bodega', label: 'Bodega' },
  ]

  const operacionOptions = [
    { value: '', label: 'Operación' },
    { value: 'venta', label: 'Venta' },
    { value: 'alquiler', label: 'Alquiler' },
  ]

  const zonaOptions = useMemo(() => [
    { value: '', label: 'Zona' },
    ...zonas.map(z => ({ value: z, label: `Zona ${z}` }))
  ], [zonas])

  const precioOptions = [
    { value: '', label: 'Precio' },
    { value: '100000', label: 'Hasta $100k' },
    { value: '200000', label: 'Hasta $200k' },
    { value: '300000', label: 'Hasta $300k' },
    { value: '500000', label: 'Hasta $500k' },
    { value: '1000000', label: 'Hasta $1M' },
  ]

  const activeFiltersCount = [tipoFilter, operacionFilter, zonaFilter, precioMaxFilter].filter(Boolean).length

  const clearAllFilters = useCallback(() => {
    setTipoFilter('')
    setOperacionFilter('')
    setZonaFilter('')
    setPrecioMaxFilter('')
  }, [])

  const filteredInmuebles = useMemo(() => {
    return inmuebles.filter(inmueble => {
      const matchesTipo = tipoFilter === '' || inmueble.tipo === tipoFilter
      const matchesOperacion = operacionFilter === '' || inmueble.operacion === operacionFilter
      const matchesZona = zonaFilter === '' || inmueble.zona === zonaFilter
      const matchesPrecio = precioMaxFilter === '' || inmueble.precio <= parseFloat(precioMaxFilter)
      return matchesTipo && matchesOperacion && matchesZona && matchesPrecio
    })
  }, [inmuebles, tipoFilter, operacionFilter, zonaFilter, precioMaxFilter])

  const displayInmuebles = useMemo(() => {
    if (selectedIds.length === 0) return filteredInmuebles
    return filteredInmuebles.filter(i => selectedIds.includes(i.id))
  }, [filteredInmuebles, selectedIds])

  const handleMapPropertySelect = useCallback((id: number) => {
    setSelectedPropertyId(id)
    const indexInDisplay = displayInmuebles.findIndex(i => i.id === id)
    if (indexInDisplay !== -1) {
      const targetPage = Math.floor(indexInDisplay / ITEMS_PER_PAGE) + 1
      setCurrentPage(targetPage)
    }
  }, [displayInmuebles])

  const totalPages = Math.ceil(displayInmuebles.length / ITEMS_PER_PAGE)

  const paginatedInmuebles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return displayInmuebles.slice(start, start + ITEMS_PER_PAGE)
  }, [displayInmuebles, currentPage])

  const inmueblesWithCoords = useMemo(() =>
    inmuebles.filter(i => i.latitud && i.longitud).length,
    [inmuebles]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#00F0D0] animate-spin" />
          <p className="text-gray-500">Cargando propiedades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-white overflow-hidden">
      <Header activePage="inmuebles" />

      <main className="flex-1 pt-20 flex flex-col lg:flex-row overflow-hidden">
        {isMobile ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-[45vh] min-h-[280px] max-h-[400px] relative flex-shrink-0">
              <PropertyMapAloba
                inmuebles={filteredInmuebles}
                onSelectionChange={handleSelectionChange}
                selectedPropertyId={selectedPropertyId}
                hoveredPropertyIdFromGrid={hoveredPropertyId}
                onPropertySelect={handleMapPropertySelect}
                onMarkerHover={handleMarkerHover}
              />
            </div>

            <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0B1B32]">
                    {displayInmuebles.length} propiedades
                  </span>
                  {selectedIds.length > 0 && (
                    <span className="text-[10px] bg-[#00F0D0]/20 text-[#0B1B32] px-2 py-0.5 rounded-full font-medium">
                      {selectedIds.length} en zona
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    showMobileFilters || activeFiltersCount > 0 ? 'bg-[#00F0D0] text-[#0B1B32]' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <SlidersHorizontal size={12} />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 bg-[#0B1B32] text-white text-[9px] rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {showMobileFilters && (
                <div className="flex flex-wrap gap-2 pb-2">
                  <FilterDropdown
                    label="Tipo"
                    value={tipoFilter}
                    options={tipoOptions}
                    onChange={setTipoFilter}
                    compact
                  />
                  <FilterDropdown
                    label="Operación"
                    value={operacionFilter}
                    options={operacionOptions}
                    onChange={setOperacionFilter}
                    compact
                  />
                  <FilterDropdown
                    label="Zona"
                    value={zonaFilter}
                    options={zonaOptions}
                    onChange={setZonaFilter}
                    compact
                  />
                  <FilterDropdown
                    label="Precio"
                    value={precioMaxFilter}
                    options={precioOptions}
                    onChange={setPrecioMaxFilter}
                    compact
                  />
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={10} />
                      Limpiar
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              <div className="px-4 py-3">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {displayInmuebles.slice(0, 20).map((inmueble) => (
                      <div
                        key={inmueble.id}
                        className="w-[260px] flex-shrink-0"
                      >
                        <InmuebleCardMap
                          inmueble={inmueble}
                          isSelected={selectedPropertyId === inmueble.id}
                          isHovered={hoveredPropertyId === inmueble.id}
                          onHover={handlePropertyHover}
                          onClick={handleMobileCardClick}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {displayInmuebles.length > 20 && (
                  <div className="mt-3 text-center">
                    <Link
                      href="/inmuebles"
                      className="inline-flex items-center gap-1 text-sm text-[#00F0D0] hover:text-[#00dbbe] font-medium"
                    >
                      Ver todas las propiedades
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                )}

                {displayInmuebles.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <MapPin className="w-10 h-10 text-gray-300 mb-2" />
                    <p className="text-sm font-medium">No hay propiedades</p>
                    <p className="text-xs text-gray-400">Dibuja una zona en el mapa</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="w-[520px] xl:w-[580px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/50">
              <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-[#0B1B32]">Propiedades</h2>
                  <Link
                    href="/inmuebles"
                    className="text-sm text-[#00F0D0] hover:text-[#00dbbe] font-medium flex items-center gap-1"
                  >
                    Ver todas
                    <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {displayInmuebles.length} disponibles
                  </span>
                  {selectedIds.length > 0 && (
                    <span className="text-xs bg-[#00F0D0]/20 text-[#0B1B32] px-2.5 py-1 rounded-full font-medium">
                      {selectedIds.length} en zona seleccionada
                    </span>
                  )}
                  {inmueblesWithCoords === 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                      Sin coordenadas GPS
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {displayInmuebles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                    <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-base font-medium text-center">No hay propiedades</p>
                    <p className="text-sm text-center text-gray-400 mt-1">
                      Dibuja una zona en el mapa para filtrar
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {paginatedInmuebles.map((inmueble) => (
                      <InmuebleCardMap
                        key={inmueble.id}
                        inmueble={inmueble}
                        isSelected={selectedPropertyId === inmueble.id}
                        isHovered={hoveredPropertyId === inmueble.id}
                        onHover={handlePropertyHover}
                        onClick={handleViewProperty}
                      />
                    ))}
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 bg-white">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {currentPage > 2 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="w-8 h-8 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          1
                        </button>
                        {currentPage > 3 && (
                          <span className="w-6 text-center text-gray-400 text-xs">...</span>
                        )}
                      </>
                    )}

                    {Array.from({ length: 5 }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      if (page > totalPages) return null
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                            currentPage === page
                              ? 'bg-[#00F0D0] text-[#0B1B32]'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    {currentPage < totalPages - 1 && totalPages > 5 && (
                      <>
                        {currentPage < totalPages - 2 && (
                          <span className="w-6 text-center text-gray-400 text-xs">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col relative">
              <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2 flex-wrap z-[1000]">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  <FilterDropdown
                    label="Tipo"
                    value={tipoFilter}
                    options={tipoOptions}
                    onChange={setTipoFilter}
                    compact
                  />
                  <FilterDropdown
                    label="Operación"
                    value={operacionFilter}
                    options={operacionOptions}
                    onChange={setOperacionFilter}
                    compact
                  />
                  <FilterDropdown
                    label="Zona"
                    value={zonaFilter}
                    options={zonaOptions}
                    onChange={setZonaFilter}
                    compact
                  />
                  <FilterDropdown
                    label="Precio"
                    value={precioMaxFilter}
                    options={precioOptions}
                    onChange={setPrecioMaxFilter}
                    compact
                  />
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={12} />
                      Limpiar
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {filteredInmuebles.filter(i => i.latitud && i.longitud).length} en mapa
                </span>
              </div>

              <div className="flex-1 relative">
                <PropertyMapAloba
                  inmuebles={filteredInmuebles}
                  onSelectionChange={handleSelectionChange}
                  selectedPropertyId={selectedPropertyId}
                  hoveredPropertyIdFromGrid={hoveredPropertyId}
                  onPropertySelect={handleMapPropertySelect}
                  onMarkerHover={handleMarkerHover}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <style jsx global>{`
        .property-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        .property-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .property-popup .leaflet-popup-tip {
          background: white;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
