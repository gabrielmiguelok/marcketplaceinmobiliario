'use client'

import { useRef, useCallback, useState, useEffect, useMemo, createRef, RefObject } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Rectangle } from 'react-leaflet'
import L from 'leaflet'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point, polygon } from '@turf/helpers'
import 'leaflet/dist/leaflet.css'
import { useCurrency } from '@/lib/currency-context'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export interface MapInmueble {
  id: number
  titulo: string
  ubicacion: string
  zona: string
  precio_usd: number
  precio_gtq: number
  moneda: string
  tipo: string
  operacion?: string
  habitaciones?: number
  banos?: number
  metros_cuadrados?: number
  imagen_url?: string | null
  latitud?: number
  longitud?: number
}

interface PropertyMapAlobaProps {
  inmuebles: MapInmueble[]
  onSelectionChange: (selectedIds: number[]) => void
  selectedPropertyId?: number | null
  hoveredPropertyIdFromGrid?: number | null
  onPropertySelect?: (id: number) => void
  onMarkerHover?: (id: number | null) => void
}

const MARKER_COLORS: Record<string, string> = {
  apartamento: '#3b82f6',
  casa: '#22c55e',
  terreno: '#f59e0b',
  oficina: '#8b5cf6',
  local: '#ec4899',
  bodega: '#6b7280',
}

const MARKER_ICONS: Record<string, string> = {
  casa: '<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />',
  apartamento: '<path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" />',
  terreno: '<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />',
  oficina: '<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v8H6V4z" clip-rule="evenodd" />',
  local: '<path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/>',
  bodega: '<path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" clip-rule="evenodd"/>',
}

const iconCache = new Map<string, L.DivIcon>()

function createPropertyIcon(type: string, isSelected: boolean, isHovered: boolean) {
  const cacheKey = `${type}-${isSelected}-${isHovered}`
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!
  }

  const bgColor = isSelected ? '#00F0D0' : isHovered ? '#facc15' : (MARKER_COLORS[type] || '#6b7280')
  const size = isSelected || isHovered ? 40 : 32

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
        transform: translate3d(0,0,0);
        transition: all 0.2s ease;
        ${isSelected ? 'box-shadow: 0 0 0 4px rgba(0, 240, 208, 0.4), 0 4px 12px rgba(0,0,0,0.3);' : ''}
        ${isHovered ? 'box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.4), 0 4px 12px rgba(0,0,0,0.3);' : ''}
      ">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="${isSelected ? '#0B1B32' : 'white'}">
          ${MARKER_ICONS[type] || MARKER_ICONS.casa}
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })

  iconCache.set(cacheKey, icon)
  return icon
}

function FlyToProperty({ inmueble, zoom = 15, duration = 0.5 }: { inmueble: MapInmueble | null, zoom?: number, duration?: number }) {
  const map = useMap()

  useEffect(() => {
    if (inmueble && inmueble.latitud && inmueble.longitud) {
      map.flyTo([inmueble.latitud, inmueble.longitud], zoom, {
        duration,
      })
    }
  }, [inmueble, map, zoom, duration])

  return null
}

interface HoverHandlerProps {
  hoveredId: number | null
  markerRefs: Map<number, RefObject<L.Marker>>
  inmuebles: MapInmueble[]
}

function HoverHandler({ hoveredId, markerRefs, inmuebles }: HoverHandlerProps) {
  const map = useMap()
  const lastHoveredRef = useRef<number | null>(null)

  useEffect(() => {
    if (hoveredId && hoveredId !== lastHoveredRef.current) {
      const markerRef = markerRefs.get(hoveredId)
      const inmueble = inmuebles.find(i => i.id === hoveredId)

      if (markerRef?.current && inmueble?.latitud && inmueble?.longitud) {
        map.flyTo([inmueble.latitud, inmueble.longitud], Math.max(map.getZoom(), 14), {
          duration: 0.3,
        })

        setTimeout(() => {
          markerRef.current?.openPopup()
        }, 300)
      }
      lastHoveredRef.current = hoveredId
    }
  }, [hoveredId, markerRefs, inmuebles, map])

  return null
}

interface SelectionHandlerProps {
  isDrawMode: boolean
  onSelectionComplete: (bounds: L.LatLngBounds) => void
  onDrawingChange: (isDrawing: boolean) => void
  currentBounds: L.LatLngBounds | null
  setCurrentBounds: (bounds: L.LatLngBounds | null) => void
}

function SelectionHandler({
  isDrawMode,
  onSelectionComplete,
  onDrawingChange,
  currentBounds,
  setCurrentBounds
}: SelectionHandlerProps) {
  const map = useMap()
  const startPointRef = useRef<L.LatLng | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const container = map.getContainer()

    if (isDrawMode) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.scrollWheelZoom.disable()
      container.style.cursor = 'crosshair'
      container.style.touchAction = 'none'
    } else {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      map.scrollWheelZoom.enable()
      container.style.cursor = ''
      container.style.touchAction = ''
    }

    return () => {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      map.scrollWheelZoom.enable()
      container.style.cursor = ''
      container.style.touchAction = ''
    }
  }, [isDrawMode, map])

  useEffect(() => {
    if (!isDrawMode) return

    const container = map.getContainer()

    const handleTouchStart = (e: TouchEvent) => {
      if (!isDrawMode || e.touches.length !== 1) return
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      const rect = container.getBoundingClientRect()
      const point = map.containerPointToLatLng(L.point(touch.clientX - rect.left, touch.clientY - rect.top))
      startPointRef.current = point
      setIsDrawing(true)
      onDrawingChange(true)
      setCurrentBounds(null)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawMode || !isDrawing || !startPointRef.current || e.touches.length !== 1) return
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      const rect = container.getBoundingClientRect()
      const point = map.containerPointToLatLng(L.point(touch.clientX - rect.left, touch.clientY - rect.top))
      const bounds = L.latLngBounds(startPointRef.current, point)
      setCurrentBounds(bounds)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDrawMode || !isDrawing || !startPointRef.current) return
      e.preventDefault()
      e.stopPropagation()
      if (currentBounds) {
        onSelectionComplete(currentBounds)
      }
      setIsDrawing(false)
      onDrawingChange(false)
      startPointRef.current = null
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDrawMode, isDrawing, currentBounds, map, onSelectionComplete, onDrawingChange, setCurrentBounds])

  useMapEvents({
    mousedown(e) {
      if (!isDrawMode) return
      startPointRef.current = e.latlng
      setIsDrawing(true)
      onDrawingChange(true)
      setCurrentBounds(null)
    },
    mousemove(e) {
      if (!isDrawMode || !isDrawing || !startPointRef.current) return
      const bounds = L.latLngBounds(startPointRef.current, e.latlng)
      setCurrentBounds(bounds)
    },
    mouseup() {
      if (!isDrawMode || !isDrawing || !startPointRef.current || !currentBounds) return
      onSelectionComplete(currentBounds)
      setIsDrawing(false)
      onDrawingChange(false)
      startPointRef.current = null
    },
  })

  return currentBounds ? (
    <Rectangle
      bounds={currentBounds}
      pathOptions={{
        color: '#00F0D0',
        fillColor: '#00F0D0',
        fillOpacity: 0.2,
        weight: 2,
      }}
    />
  ) : null
}


function getImageSrc(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('/inmuebles/') || url.startsWith('/uploads/')) {
    return `/api/imagen${url}`
  }
  if (url.startsWith('/') && !url.startsWith('/api/')) {
    return `/api/imagen${url}`
  }
  return url
}

export default function PropertyMapAloba({
  inmuebles,
  onSelectionChange,
  selectedPropertyId,
  hoveredPropertyIdFromGrid,
  onPropertySelect,
  onMarkerHover
}: PropertyMapAlobaProps) {
  const { formatPriceCompact } = useCurrency()
  const [isDrawMode, setIsDrawMode] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawBounds, setCurrentDrawBounds] = useState<L.LatLngBounds | null>(null)
  const [savedSelections, setSavedSelections] = useState<L.LatLngBounds[]>([])
  const [allSelectedIds, setAllSelectedIds] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const inmueblesWithCoords = useMemo(() =>
    inmuebles.filter(i => i.latitud && i.longitud),
    [inmuebles]
  )

  const centerCoords = useMemo(() => {
    if (inmueblesWithCoords.length === 0) {
      return { lat: 14.6349, lng: -90.5069 }
    }
    const validCoords = inmueblesWithCoords.filter(i =>
      typeof i.latitud === 'number' && !isNaN(i.latitud) &&
      typeof i.longitud === 'number' && !isNaN(i.longitud)
    )
    if (validCoords.length === 0) {
      return { lat: 14.6349, lng: -90.5069 }
    }
    const avgLat = validCoords.reduce((sum, i) => sum + i.latitud!, 0) / validCoords.length
    const avgLng = validCoords.reduce((sum, i) => sum + i.longitud!, 0) / validCoords.length
    if (isNaN(avgLat) || isNaN(avgLng)) {
      return { lat: 14.6349, lng: -90.5069 }
    }
    return { lat: avgLat, lng: avgLng }
  }, [inmueblesWithCoords])

  const selectedInmueble = selectedPropertyId
    ? inmueblesWithCoords.find(i => i.id === selectedPropertyId) || null
    : null

  const getPropertiesInBounds = useCallback((bounds: L.LatLngBounds): number[] => {
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const coordinates = [
      [sw.lng, sw.lat],
      [ne.lng, sw.lat],
      [ne.lng, ne.lat],
      [sw.lng, ne.lat],
      [sw.lng, sw.lat],
    ]

    const turfPolygon = polygon([coordinates])
    const ids: number[] = []

    inmueblesWithCoords.forEach((inmueble) => {
      if (inmueble.latitud && inmueble.longitud) {
        const pt = point([inmueble.longitud, inmueble.latitud])
        if (booleanPointInPolygon(pt, turfPolygon)) {
          ids.push(inmueble.id)
        }
      }
    })

    return ids
  }, [inmueblesWithCoords])

  const handleSelectionComplete = useCallback((bounds: L.LatLngBounds) => {
    const newIds = getPropertiesInBounds(bounds)

    setSavedSelections(prev => [...prev, bounds])

    setAllSelectedIds(prev => {
      const updated = new Set(prev)
      newIds.forEach(id => updated.add(id))
      onSelectionChange(Array.from(updated))
      return updated
    })

    setCurrentDrawBounds(null)
  }, [getPropertiesInBounds, onSelectionChange])

  const toggleDrawMode = useCallback(() => {
    setIsDrawMode(prev => !prev)
    setCurrentDrawBounds(null)
  }, [])

  const clearAllSelections = useCallback(() => {
    setSavedSelections([])
    setAllSelectedIds(new Set())
    setCurrentDrawBounds(null)
    setIsDrawMode(false)
    onSelectionChange([])
  }, [onSelectionChange])

  const hasSelections = savedSelections.length > 0

  const effectiveHoveredId = hoveredPropertyIdFromGrid ?? hoveredId

  const fallbackImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400"

  const markerRefs = useMemo(() => {
    const refs = new Map<number, RefObject<L.Marker>>()
    inmueblesWithCoords.forEach(inmueble => {
      refs.set(inmueble.id, createRef<L.Marker>())
    })
    return refs
  }, [inmueblesWithCoords])

  const markers = useMemo(() => (
    inmueblesWithCoords.map((inmueble) => {
      const imageUrl = getImageSrc(inmueble.imagen_url) || fallbackImage
      const isHovered = effectiveHoveredId === inmueble.id
      const isSelected = selectedPropertyId === inmueble.id

      return (
        <Marker
          key={inmueble.id}
          ref={markerRefs.get(inmueble.id)}
          position={[inmueble.latitud!, inmueble.longitud!]}
          icon={createPropertyIcon(inmueble.tipo, isSelected, isHovered)}
          zIndexOffset={isSelected ? 1000 : isHovered ? 500 : 0}
          eventHandlers={{
            click: () => onPropertySelect?.(inmueble.id),
            mouseover: () => {
              setHoveredId(inmueble.id)
              onMarkerHover?.(inmueble.id)
            },
            mouseout: () => {
              setHoveredId(null)
              onMarkerHover?.(null)
            },
          }}
        >
          <Popup className="property-popup" minWidth={260} maxWidth={300}>
            <div className="overflow-hidden rounded-lg">
              <div className="relative h-28 w-full">
                <img
                  src={imageUrl}
                  alt={inmueble.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="bg-[#00F0D0] text-[#0B1B32] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {inmueble.tipo === 'apartamento' ? 'Apto' : inmueble.tipo.charAt(0).toUpperCase() + inmueble.tipo.slice(1)}
                  </span>
                  <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">
                    {inmueble.operacion === 'alquiler' ? 'Alquiler' : 'Venta'}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-white font-bold text-base drop-shadow-lg">
                    {formatPriceCompact(inmueble.precio_usd, inmueble.precio_gtq, inmueble.moneda)}
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-white">
                <h3 className="font-bold text-[#0B1B32] text-sm leading-tight line-clamp-1 mb-1">
                  {inmueble.titulo}
                </h3>
                <p className="text-gray-500 text-xs mb-1.5">
                  {inmueble.zona ? `Zona ${inmueble.zona} · ` : ''}{inmueble.ubicacion}
                </p>
                <div className="flex items-center gap-3 text-gray-500 text-xs">
                  {inmueble.habitaciones && inmueble.habitaciones > 0 && (
                    <span>{inmueble.habitaciones} hab</span>
                  )}
                  {inmueble.banos && inmueble.banos > 0 && (
                    <span>{inmueble.banos} baños</span>
                  )}
                  {inmueble.metros_cuadrados && inmueble.metros_cuadrados > 0 && (
                    <span>{inmueble.metros_cuadrados}m²</span>
                  )}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      )
    })
  ), [inmueblesWithCoords, selectedPropertyId, effectiveHoveredId, onPropertySelect, onMarkerHover, fallbackImage, markerRefs])

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[centerCoords.lat, centerCoords.lng]}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        preferCanvas={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          updateWhenIdle={true}
          updateWhenZooming={false}
        />

        <SelectionHandler
          isDrawMode={isDrawMode}
          onSelectionComplete={handleSelectionComplete}
          onDrawingChange={setIsDrawing}
          currentBounds={currentDrawBounds}
          setCurrentBounds={setCurrentDrawBounds}
        />

        <FlyToProperty inmueble={selectedInmueble} />

        <HoverHandler
          hoveredId={hoveredPropertyIdFromGrid ?? null}
          markerRefs={markerRefs}
          inmuebles={inmueblesWithCoords}
        />

        {savedSelections.map((bounds, index) => (
          <Rectangle
            key={index}
            bounds={bounds}
            pathOptions={{
              color: '#00F0D0',
              fillColor: '#00F0D0',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '6, 6',
            }}
          />
        ))}

        {markers}
      </MapContainer>

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={toggleDrawMode}
          className={`
            px-5 py-3 rounded-2xl font-semibold text-sm shadow-lg
            transition-all duration-300 active:scale-95 backdrop-blur-md
            ${isDrawMode
              ? 'bg-[#00F0D0] text-[#0B1B32] shadow-[#00F0D0]/30'
              : 'bg-white/95 text-[#0B1B32] hover:bg-white border border-gray-200'}
          `}
        >
          {isDrawMode ? '✓ Confirmar' : '⬚ Dibujar zona'}
        </button>

        {hasSelections && (
          <button
            onClick={clearAllSelections}
            className="px-5 py-3 rounded-2xl font-semibold text-sm shadow-lg
              bg-white/95 text-[#0B1B32] hover:bg-white backdrop-blur-md border border-gray-200
              transition-all duration-300 active:scale-95"
          >
            ✕ Limpiar ({allSelectedIds.size})
          </button>
        )}
      </div>

      <div className="absolute bottom-2 left-2 text-[10px] text-gray-400 z-[400]">
        © OpenStreetMap
      </div>

      {!isDrawMode && !hasSelections && inmueblesWithCoords.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
          bg-[#0B1B32]/90 text-white text-sm px-5 py-2.5 rounded-full backdrop-blur-md
          pointer-events-none shadow-lg">
          Dibuja una zona para filtrar propiedades
        </div>
      )}

      {isDrawMode && !isDrawing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
          bg-[#00F0D0] text-[#0B1B32] text-sm font-semibold px-5 py-2.5 rounded-full backdrop-blur-md
          pointer-events-none shadow-lg">
          Arrastra para seleccionar área
        </div>
      )}

      {isDrawing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
          bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full backdrop-blur-md
          pointer-events-none shadow-lg">
          Suelta para confirmar selección
        </div>
      )}
    </div>
  )
}
