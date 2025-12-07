'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import InmuebleCardMap from '@/components/map/InmuebleCardMap'
import { ChevronLeft, ChevronRight, Map, Grid, MapPin, Loader2 } from 'lucide-react'

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

export default function MapaInmueblesPage() {
  const router = useRouter()
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [showMap, setShowMap] = useState(true)

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

  const handlePropertyClick = useCallback((id: number) => {
    setSelectedPropertyId(id)
    if (isMobile) {
      setShowMap(true)
    }
  }, [isMobile])

  const handleViewProperty = useCallback((id: number) => {
    router.push(`/inmuebles/${id}`)
  }, [router])

  const displayInmuebles = useMemo(() => {
    if (selectedIds.length === 0) return inmuebles
    return inmuebles.filter(i => selectedIds.includes(i.id))
  }, [inmuebles, selectedIds])

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
        {isMobile && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#0B1B32]">
                {displayInmuebles.length} propiedades
              </span>
              {selectedIds.length > 0 && (
                <span className="text-xs bg-[#00F0D0]/20 text-[#0B1B32] px-2.5 py-1 rounded-full font-medium">
                  {selectedIds.length} en zona
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMap(false)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  !showMap ? 'bg-[#00F0D0] text-[#0B1B32]' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Grid size={16} />
                Lista
              </button>
              <button
                onClick={() => setShowMap(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  showMap ? 'bg-[#00F0D0] text-[#0B1B32]' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Map size={16} />
                Mapa
              </button>
            </div>
          </div>
        )}

        {isMobile ? (
          showMap ? (
            <div className="flex-1 relative">
              <PropertyMapAloba
                inmuebles={inmuebles}
                onSelectionChange={handleSelectionChange}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertyClick}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {displayInmuebles.map((inmueble) => (
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
            </div>
          )
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
                <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                      Anterior
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-[#00F0D0] text-[#0B1B32]'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Siguiente
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <PropertyMapAloba
                inmuebles={inmuebles}
                onSelectionChange={handleSelectionChange}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertyClick}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
