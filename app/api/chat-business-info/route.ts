export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import OpenAI from "openai"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"

interface InmuebleResult {
  id: number
  titulo: string
  tipo: string
  operacion: string
  precio: number
  moneda: string
  ubicacion: string | null
  zona: string | null
  departamento: string | null
  metros_cuadrados: number | null
  habitaciones: number | null
  banos: number | null
  parqueos: number | null
  imagen_url: string | null
  destacado: boolean
}

const apiKey = (process.env.OPENAI_API_KEY || "").replace(/^['"]|['"]$/g, "")
const openai = new OpenAI({
  apiKey,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
})

const MODEL = "gpt-4o-mini"

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

function withCors(resp: Response, req: NextRequest) {
  const origin = req.headers.get("origin") || "*"
  const allowOrigin =
    ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || "*"
  resp.headers.set("Access-Control-Allow-Origin", allowOrigin)
  resp.headers.set("Vary", "Origin")
  resp.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Id")
  resp.headers.set("Access-Control-Allow-Methods", "GET, POST")
  resp.headers.set("Cache-Control", "no-store")
  return resp
}

type Bucket = { tokens: number; last: number }
const buckets = new Map<string, Bucket>()
const RPS = Number(process.env.RATE_LIMIT_RPS || 3)
const BURST = Number(process.env.RATE_LIMIT_BURST || 6)

function keyFromReq(req: NextRequest) {
  const xfwd = req.headers.get("x-forwarded-for") || ""
  const ip = xfwd.split(",")[0]?.trim() || "unknown"
  const cid = req.headers.get("x-session-id") || ""
  return cid ? `${ip}:${cid}` : ip
}

function rateLimit(req: NextRequest): boolean {
  const key = keyFromReq(req)
  const now = Date.now()
  const b = buckets.get(key) || { tokens: BURST, last: now }
  const elapsed = (now - b.last) / 1000
  const refill = elapsed * RPS
  const tokens = Math.min(BURST, b.tokens + refill)
  if (tokens < 1) {
    buckets.set(key, { tokens, last: now })
    return false
  }
  buckets.set(key, { tokens: tokens - 1, last: now })
  return true
}

const ALOBA = {
  nombre: "Aloba",
  descripcion: "Marketplace inmobiliario líder en Guatemala que conecta compradores e inquilinos con las mejores propiedades",
  lema: "Invierte con claridad. Decide con confianza.",
  url: "https://marketplaceinmobiliario.com",

  servicios: {
    principal: "Búsqueda y conexión con propiedades verificadas",
    para_usuarios: [
      "Búsqueda de inmuebles por zona, tipo y precio",
      "Filtros avanzados (habitaciones, baños, metros cuadrados)",
      "Fotos y detalles completos de cada propiedad",
      "Contacto directo por WhatsApp",
      "Información de ubicación con mapa",
      "Servicio gratuito para usuarios",
    ],
  },

  como_funciona: {
    descripcion: "Proceso simple para encontrar tu propiedad ideal",
    pasos: [
      { numero: 1, nombre: "Busca", descripcion: "Encuentra inmuebles por zona, tipo o precio" },
      { numero: 2, nombre: "Explora", descripcion: "Revisa fotos, detalles y ubicación" },
      { numero: 3, nombre: "Contacta", descripcion: "Comunícate directamente por WhatsApp" },
      { numero: 4, nombre: "Visita", descripcion: "Agenda una visita a la propiedad" },
    ],
  },

  tipos_inmuebles: {
    descripcion: "Diversos tipos de propiedades disponibles",
    lista: [
      { tipo: "apartamento", descripcion: "Studios, 1, 2, 3+ habitaciones en edificios con amenidades" },
      { tipo: "casa", descripcion: "Casas unifamiliares y en condominio con jardín y parqueo" },
      { tipo: "terreno", descripcion: "Terrenos para construcción residencial o comercial" },
      { tipo: "oficina", descripcion: "Espacios corporativos y coworking" },
      { tipo: "local", descripcion: "Locales comerciales para negocios y retail" },
      { tipo: "bodega", descripcion: "Espacios de almacenamiento industrial" },
    ],
  },

  zonas: {
    descripcion: "Las 18 zonas de Guatemala disponibles",
    destacadas: [
      { zona: "10", nombre: "Zona Viva / Oakland", caracteristicas: "Área premium, centros comerciales, vida nocturna" },
      { zona: "14", nombre: "Las Américas / La Villa", caracteristicas: "Residencial de alta gama, colegios y hospitales" },
      { zona: "15", nombre: "Vista Hermosa", caracteristicas: "Ambiente familiar, áreas verdes y parques" },
      { zona: "16", nombre: "Acatán", caracteristicas: "Desarrollo en crecimiento, excelente inversión" },
    ],
    otras: ["1", "4", "5", "6", "7", "8", "9", "11", "12", "13", "17", "18"],
  },

  rangos_precios: {
    descripcion: "Rangos de precios en dólares americanos (USD)",
    rangos: [
      { rango: "0-150000", etiqueta: "Hasta $150K", descripcion: "Apartamentos pequeños, terrenos" },
      { rango: "150000-200000", etiqueta: "$150K - $200K", descripcion: "Apartamentos 2 habitaciones" },
      { rango: "200000-250000", etiqueta: "$200K - $250K", descripcion: "Casas y apartamentos amplios" },
      { rango: "250000-300000", etiqueta: "$250K - $300K", descripcion: "Propiedades premium" },
      { rango: "300000-400000", etiqueta: "$300K - $400K", descripcion: "Inmuebles de lujo" },
      { rango: "400000+", etiqueta: "$400K+", descripcion: "Exclusivos y de inversión" },
    ],
  },

  operaciones: {
    venta: "Compra de inmuebles propios, inversión a largo plazo",
    alquiler: "Renta mensual flexible, apartamentos amueblados, oficinas",
  },

  nosotros: {
    filosofia: "Conectamos personas con las mejores propiedades en Guatemala de forma transparente y eficiente",
    valores: [
      { valor: "Transparencia", descripcion: "Información completa y verificada de cada inmueble" },
      { valor: "Accesibilidad", descripcion: "Búsqueda gratuita y sin intermediarios" },
      { valor: "Confianza", descripcion: "Propiedades verificadas y datos actualizados" },
      { valor: "Eficiencia", descripcion: "Filtros inteligentes para encontrar rápido" },
    ],
  },

  faq: {
    preguntas: [
      {
        pregunta: "¿Cómo busco un inmueble?",
        respuesta: "Usa el buscador en la página principal. Puedes filtrar por zona, tipo de inmueble, rango de precio, número de habitaciones y más.",
      },
      {
        pregunta: "¿Es gratis usar Aloba?",
        respuesta: "Sí, Aloba es completamente gratis para usuarios. Puedes buscar propiedades, ver detalles y contactar sin ningún costo.",
      },
      {
        pregunta: "¿Cómo contacto al vendedor?",
        respuesta: "Cada propiedad tiene un botón de WhatsApp para contacto directo. También puedes agendar una visita desde la página del inmueble.",
      },
      {
        pregunta: "¿Las propiedades están verificadas?",
        respuesta: "Sí, verificamos la información de cada inmueble. Las fotos, precios y características son actualizados regularmente.",
      },
      {
        pregunta: "¿Puedo buscar solo alquiler o solo venta?",
        respuesta: "Sí, puedes filtrar por tipo de operación: venta o alquiler. Usa los filtros avanzados en el buscador.",
      },
    ],
  },

  contacto: {
    email: "contacto@marketplaceinmobiliario.com",
    whatsapp: "https://wa.me/50230000000",
    whatsapp_numero: "+502 3000 0000",
    ubicacion: "Guatemala, Ciudad de Guatemala",
    horario: "Lunes a Viernes: 9:00 - 18:00 hrs, Sábados: 10:00 - 14:00 hrs",
  },
}

function norm(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const PROPERTY_TYPES: Array<{ patterns: RegExp[]; value: string; label: string }> = [
  { patterns: [/\b(apartamento|apartamentos|apto|aptos|depa|depas|departamento|departamentos|piso|pisos)\b/], value: "apartamento", label: "Apartamento" },
  { patterns: [/\b(casa|casas|vivienda|viviendas|residencia|residencias|chalet|chalets)\b/], value: "casa", label: "Casa" },
  { patterns: [/\b(terreno|terrenos|lote|lotes|parcela|parcelas|finca|fincas)\b/], value: "terreno", label: "Terreno" },
  { patterns: [/\b(oficina|oficinas|corporativo|coworking)\b/], value: "oficina", label: "Oficina" },
  { patterns: [/\b(local|locales|comercial|comerciales|tienda|tiendas|negocio|negocios)\b/], value: "local", label: "Local" },
  { patterns: [/\b(bodega|bodegas|almacen|almacenes|galpon|galpones)\b/], value: "bodega", label: "Bodega" },
]

const ZONE_ALIASES: Record<string, string> = {
  "centro historico": "1",
  "centro civico": "4",
  "zona viva": "10",
  "oakland": "10",
  "las americas": "14",
  "la villa": "14",
  "vista hermosa": "15",
  "acatan": "16",
  "cayala": "16",
}

const OPERATION_PATTERNS: Array<{ patterns: RegExp[]; value: string; label: string }> = [
  { patterns: [/\b(comprar|compra|venta|vender|adquirir|inversion|invertir)\b/], value: "venta", label: "En venta" },
  { patterns: [/\b(alquilar|alquiler|renta|rentar|arrendar|arrendamiento|arrendar)\b/], value: "alquiler", label: "En alquiler" },
]

const HABITACIONES_PATTERNS: Array<{ pattern: RegExp; value: number }> = [
  { pattern: /\b(studio|estudio|loft)\b/, value: 1 },
  { pattern: /\buna?\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 1 },
  { pattern: /\b1\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 1 },
  { pattern: /\bdos\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 2 },
  { pattern: /\b2\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 2 },
  { pattern: /\btres\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 3 },
  { pattern: /\b3\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 3 },
  { pattern: /\bcuatro\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 4 },
  { pattern: /\b4\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: 4 },
  { pattern: /\b(\d+)\s*(habitacion|habitaciones|cuarto|cuartos|recamara|recamaras)\b/, value: -1 },
]

const SEARCH_PATTERNS = [
  /\b(busco|buscar|necesito|quiero|interesa|muestrame|mostrar|ver)\b/i,
  /\b(apartamento|casa|terreno|oficina|local|bodega|inmueble|propiedad)\b/i,
  /\bzona\s*\d+/i,
  /\bz\s*\d+/i,
  /\d+\s*(habitacion|cuarto|recamara)/i,
  /\$\s*\d+/i,
  /\d+\s*(mil|k)\b/i,
]

const PROPERTY_INTENT_WORDS = [
  "buscar", "busco", "necesito", "quiero", "interesa", "muestrame",
  "apartamento", "casa", "terreno", "oficina", "local", "bodega",
  "inmueble", "propiedad", "vivienda",
  "comprar", "alquilar", "rentar", "venta", "alquiler",
  "habitacion", "habitaciones", "cuarto", "cuartos", "recamara",
  "zona", "ubicacion", "precio", "presupuesto",
]

interface SearchFilters {
  tipo?: string
  zona?: string
  operacion?: string
  habitaciones?: number
  precioMin?: number
  precioMax?: number
}

function detectZone(text: string): { zona: string; label: string } | null {
  const normalized = norm(text)

  for (const [alias, zoneNum] of Object.entries(ZONE_ALIASES)) {
    if (normalized.includes(alias)) {
      return { zona: zoneNum, label: `Zona ${zoneNum}` }
    }
  }

  const zonePatterns = [
    /\bzona\s*(\d{1,2})\b/i,
    /\bz\s*(\d{1,2})\b/i,
    /\bz(\d{1,2})\b/i,
    /\ben\s+la\s+(\d{1,2})\b/i,
  ]

  for (const pattern of zonePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const zoneNum = match[1]
      const validZones = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"]
      if (validZones.includes(zoneNum)) {
        return { zona: zoneNum, label: `Zona ${zoneNum}` }
      }
    }
  }

  return null
}

function detectPropertyType(text: string): { tipo: string; label: string } | null {
  const normalized = norm(text)

  for (const typeInfo of PROPERTY_TYPES) {
    for (const pattern of typeInfo.patterns) {
      if (pattern.test(normalized)) {
        return { tipo: typeInfo.value, label: typeInfo.label }
      }
    }
  }

  return null
}

function detectOperation(text: string): { operacion: string; label: string } | null {
  const normalized = norm(text)

  for (const opInfo of OPERATION_PATTERNS) {
    for (const pattern of opInfo.patterns) {
      if (pattern.test(normalized)) {
        return { operacion: opInfo.value, label: opInfo.label }
      }
    }
  }

  return null
}

function detectHabitaciones(text: string): { habitaciones: number; label: string } | null {
  const normalized = norm(text)

  for (const habInfo of HABITACIONES_PATTERNS) {
    const match = normalized.match(habInfo.pattern)
    if (match) {
      let value = habInfo.value
      if (value === -1 && match[1]) {
        value = parseInt(match[1])
      }
      if (value > 0 && value <= 10) {
        return { habitaciones: value, label: `${value} habitación${value > 1 ? 'es' : ''}` }
      }
    }
  }

  return null
}

function detectPriceRange(text: string): { precioMin?: number; precioMax?: number; label?: string } {
  const normalized = norm(text)
  const result: { precioMin?: number; precioMax?: number; label?: string } = {}

  const pricePatterns = [
    /\$\s*([\d,]+)\s*(?:mil|k)?/gi,
    /([\d,]+)\s*(?:mil|k)\b/gi,
    /([\d,]+)\s*(?:dolares|usd)/gi,
    /(?:presupuesto|budget)\s*(?:de)?\s*\$?\s*([\d,]+)/gi,
  ]

  const prices: number[] = []

  for (const pattern of pricePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      let numStr = match[1].replace(/,/g, '')
      let value = parseInt(numStr)

      if (match[0].toLowerCase().includes('k') || match[0].toLowerCase().includes('mil')) {
        value *= 1000
      }

      if (value > 0 && value < 100) {
        value *= 1000
      }

      if (value > 100 && value < 1000) {
        value *= 1000
      }

      if (value >= 10000 && value <= 50000000) {
        prices.push(value)
      }
    }
  }

  if (prices.length > 0) {
    const hasHasta = /\b(hasta|menos de|maximo|max|menor a|menor que)\b/.test(normalized)
    const hasDesde = /\b(desde|minimo|min|mayor a|mayor que|mas de)\b/.test(normalized)

    if (hasHasta) {
      result.precioMax = Math.max(...prices)
      result.label = `Hasta $${result.precioMax.toLocaleString()}`
    } else if (hasDesde) {
      result.precioMin = Math.min(...prices)
      result.label = `Desde $${result.precioMin.toLocaleString()}`
    } else if (prices.length === 1) {
      result.precioMin = Math.floor(prices[0] * 0.8)
      result.precioMax = Math.ceil(prices[0] * 1.2)
      result.label = `~$${prices[0].toLocaleString()}`
    } else if (prices.length >= 2) {
      result.precioMin = Math.min(...prices)
      result.precioMax = Math.max(...prices)
      result.label = `$${result.precioMin.toLocaleString()} - $${result.precioMax.toLocaleString()}`
    }
  }

  return result
}

function detectSearchIntent(text: string): { isSearch: boolean; filters: SearchFilters; searchTerms: string[] } {
  const normalized = norm(text)
  const filters: SearchFilters = {}
  const searchTerms: string[] = []

  const typeResult = detectPropertyType(text)
  if (typeResult) {
    filters.tipo = typeResult.tipo
    searchTerms.push(typeResult.label)
  }

  const zoneResult = detectZone(text)
  if (zoneResult) {
    filters.zona = zoneResult.zona
    searchTerms.push(zoneResult.label)
  }

  const opResult = detectOperation(text)
  if (opResult) {
    filters.operacion = opResult.operacion
    searchTerms.push(opResult.label)
  }

  const habResult = detectHabitaciones(text)
  if (habResult) {
    filters.habitaciones = habResult.habitaciones
    searchTerms.push(habResult.label)
  }

  const priceResult = detectPriceRange(text)
  if (priceResult.precioMin) filters.precioMin = priceResult.precioMin
  if (priceResult.precioMax) filters.precioMax = priceResult.precioMax
  if (priceResult.label) searchTerms.push(priceResult.label)

  const matchesPattern = SEARCH_PATTERNS.some(pattern => pattern.test(text))
  const intentCount = PROPERTY_INTENT_WORDS.filter(word => normalized.includes(word)).length

  const hasFilters = Object.keys(filters).length > 0
  const isSearch = hasFilters || (matchesPattern && intentCount >= 1) || intentCount >= 2

  console.log("[CHAT] detectSearchIntent:", {
    originalText: text.substring(0, 80),
    filters,
    searchTerms,
    matchesPattern,
    intentCount,
    isSearch
  })

  return { isSearch, filters, searchTerms: [...new Set(searchTerms)] }
}

async function searchInmuebles(filters: SearchFilters, limit: number = 6): Promise<InmuebleResult[]> {
  try {
    const conditions: string[] = ["estado = 'disponible'"]
    const params: (string | number)[] = []

    if (filters.tipo) {
      conditions.push("tipo = ?")
      params.push(filters.tipo)
    }

    if (filters.zona) {
      conditions.push("zona = ?")
      params.push(filters.zona)
    }

    if (filters.operacion) {
      conditions.push("operacion = ?")
      params.push(filters.operacion)
    }

    if (filters.habitaciones) {
      if (filters.habitaciones >= 4) {
        conditions.push("habitaciones >= 4")
      } else {
        conditions.push("habitaciones = ?")
        params.push(filters.habitaciones)
      }
    }

    if (filters.precioMin) {
      conditions.push("precio >= ?")
      params.push(filters.precioMin)
    }

    if (filters.precioMax) {
      conditions.push("precio <= ?")
      params.push(filters.precioMax)
    }

    params.push(limit)

    const sql = `
      SELECT id, titulo, tipo, operacion, precio, moneda, ubicacion, zona,
             departamento, metros_cuadrados, habitaciones, banos, parqueos,
             imagen_url, destacado
      FROM inmuebles
      WHERE ${conditions.join(" AND ")}
      ORDER BY destacado DESC, created_at DESC
      LIMIT ?
    `

    const inmuebles = await query<InmuebleResult>(sql, params)

    if (inmuebles.length === 0 && Object.keys(filters).length > 1) {
      const fallbackSql = `
        SELECT id, titulo, tipo, operacion, precio, moneda, ubicacion, zona,
               departamento, metros_cuadrados, habitaciones, banos, parqueos,
               imagen_url, destacado
        FROM inmuebles
        WHERE estado = 'disponible'
        ORDER BY destacado DESC, created_at DESC
        LIMIT ?
      `
      return await query<InmuebleResult>(fallbackSql, [limit])
    }

    return inmuebles
  } catch (error) {
    console.error("[CHAT] Error searching inmuebles:", error)
    return []
  }
}

function pickCanonSubset(lastUser: string) {
  const n = norm(lastUser || "")

  const servicioKeywords = ["servicio", "buscar", "inmueble", "propiedad", "apartamento", "casa"]
  const comoKeywords = ["como", "cómo", "funciona", "proceso", "pasos"]
  const tiposKeywords = ["tipo", "tipos", "apartamento", "casa", "terreno", "oficina", "local", "bodega"]
  const zonasKeywords = ["zona", "zonas", "ubicacion", "donde", "oakland", "vista hermosa"]
  const preciosKeywords = ["precio", "precios", "costo", "presupuesto", "cuanto", "rango"]
  const nosotrosKeywords = ["nosotros", "sobre", "empresa", "quienes", "aloba"]
  const contactoKeywords = ["contacto", "telefono", "whatsapp", "email", "correo"]
  const faqKeywords = ["pregunta", "faq", "duda", "ayuda"]

  const wantsServicio = servicioKeywords.some((k) => n.includes(k))
  const wantsComo = comoKeywords.some((k) => n.includes(k))
  const wantsTipos = tiposKeywords.some((k) => n.includes(k))
  const wantsZonas = zonasKeywords.some((k) => n.includes(k))
  const wantsPrecios = preciosKeywords.some((k) => n.includes(k))
  const wantsNosotros = nosotrosKeywords.some((k) => n.includes(k))
  const wantsContacto = contactoKeywords.some((k) => n.includes(k))
  const wantsFaq = faqKeywords.some((k) => n.includes(k))

  const subset: any = {
    nombre: ALOBA.nombre,
    descripcion: ALOBA.descripcion,
    lema: ALOBA.lema,
    url: ALOBA.url,
  }

  if (wantsServicio) subset.servicios = ALOBA.servicios
  if (wantsComo) subset.como_funciona = ALOBA.como_funciona
  if (wantsTipos) subset.tipos_inmuebles = ALOBA.tipos_inmuebles
  if (wantsZonas) subset.zonas = ALOBA.zonas
  if (wantsPrecios) subset.rangos_precios = ALOBA.rangos_precios
  if (wantsNosotros) subset.nosotros = ALOBA.nosotros
  if (wantsContacto) subset.contacto = ALOBA.contacto
  if (wantsFaq) subset.faq = ALOBA.faq

  if (!wantsServicio && !wantsComo && !wantsTipos && !wantsZonas && !wantsPrecios && !wantsNosotros && !wantsContacto && !wantsFaq) {
    return ALOBA
  }

  return subset
}

const CORE = `
Sos el Asistente Virtual de Aloba, el marketplace inmobiliario líder en Guatemala. Hablás profesional pero cercano, especializado en ayudar a usuarios a encontrar propiedades.

**Lo que SÍ sabés (y podés hablar):**
- Servicios: Búsqueda de inmuebles, filtros avanzados, contacto directo por WhatsApp
- Cómo funciona: Buscar, explorar, contactar, visitar
- Tipos de inmuebles: Apartamentos, casas, terrenos, oficinas, locales, bodegas
- Zonas: Las 18 zonas de Guatemala, especialmente Zona 10, 14, 15, 16
- Rangos de precios: Desde $150K hasta $400K+ en USD
- Operaciones: Venta y alquiler
- Nosotros: Marketplace inmobiliario transparente y eficiente
- Contacto: WhatsApp +502 3000 0000, email contacto@marketplaceinmobiliario.com

**Lo que NO sabés (REGLA INQUEBRANTABLE):**
- Asesoría legal o financiera específica (derivá a profesionales)
- Información de propietarios o vendedores específicos
- Tasaciones o avalúos de propiedades
- Temas fuera de inmuebles en Guatemala

**Reglas de longitud de respuesta:**
1. **Respuestas concisas (60-80 palabras)** para preguntas simples
2. **Respuestas amplias (150-200 palabras)** cuando se necesita contexto
3. **Siempre:**
   - Respondé directo a la pregunta
   - Usá **negritas** para datos clave
   - Usá [hipervínculos en markdown](url) para WhatsApp y links
   - Profesional pero cercano y amigable
   - Cerrá con UNA pregunta corta sobre búsqueda de propiedades

**REGLA CRÍTICA SOBRE URLs:**
- SIEMPRE usá las URLs EXACTAS sin modificarlas
- WhatsApp: https://wa.me/50230000000
- Web: https://marketplaceinmobiliario.com
- Inmuebles: https://marketplaceinmobiliario.com/inmuebles

**Tu estilo:**
❌ "Te invito a explorar nuestro catálogo..."
✅ "Tenemos **apartamentos en Zona 10** desde **$150K**. ¿Buscás venta o alquiler?"

❌ "¿Te gustaría asesoría legal?"
✅ "¿Te ayudo a buscar por zona o por presupuesto?"

Hablá como un asesor inmobiliario amigable que conoce perfectamente Guatemala y el mercado de propiedades.
`.trim()

type Msg = { role: "user" | "assistant" | "system"; content: string }

function buildMessages(history: Msg[], sessionContext?: Msg[], searchContext?: string) {
  const trimmed = history.slice(-8)
  const lastUser = trimmed.filter((m) => m.role === "user").pop()?.content || ""
  const canonSlim = pickCanonSubset(lastUser)

  const sys: Msg[] = [
    { role: "system", content: CORE },
    { role: "system", content: "INFORMACIÓN RELEVANTE:\n" + JSON.stringify(canonSlim, null, 2) },
  ]

  if (searchContext) {
    sys.push({ role: "system", content: searchContext })
  }

  return [
    ...sys,
    ...(Array.isArray(sessionContext) ? sessionContext : []),
    ...trimmed,
    {
      role: "system",
      content: searchContext
        ? "El usuario está buscando propiedades. Presenta los resultados de forma amigable mencionando que puede ver las opciones debajo. NO cierres con pregunta."
        : "Cerrá SIEMPRE con una pregunta corta sobre búsqueda de propiedades: zona, tipo de inmueble, presupuesto o características. NO sugieras temas que no conocés.",
    },
  ]
}

const requestSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) })).min(1),
  session: z
    .object({
      id: z.string().min(1).max(200),
      context: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) })).optional(),
      reset: z.boolean().optional(),
    })
    .optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      max_tokens: z.number().int().min(64).max(2000).optional(),
      stream: z.boolean().optional(),
    })
    .optional(),
})

const sessionStore = new Map<string, { msgs: Msg[]; touchedAt: number }>()
const SESSION_MAX_MSGS = Number(process.env.SESSION_MAX_MSGS || 16)
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60)

function getSessionHistory(sessionId?: string): Msg[] | undefined {
  if (!sessionId) return undefined
  const rec = sessionStore.get(sessionId)
  if (!rec) return undefined
  if (Date.now() - rec.touchedAt > SESSION_TTL_MS) {
    sessionStore.delete(sessionId)
    return undefined
  }
  return rec.msgs
}

function setSessionHistory(sessionId: string, history: Msg[]) {
  sessionStore.set(sessionId, { msgs: history.slice(-SESSION_MAX_MSGS), touchedAt: Date.now() })
}

function resetSession(sessionId?: string) {
  if (!sessionId) return
  sessionStore.delete(sessionId)
}

function gcSessions() {
  const now = Date.now()
  for (const [sid, rec] of sessionStore.entries()) {
    if (now - rec.touchedAt > SESSION_TTL_MS) sessionStore.delete(sid)
  }
}

function sanitize(text: string) {
  const cleaned = (text || "")
    .replace(/contentReference|oaicite|\[[0-9]+\]/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  const boldMarkers = cleaned.match(/\*\*/g) || []
  if (boldMarkers.length % 2 !== 0) {
    return cleaned + "**"
  }

  return cleaned
}

function getSafeDefault() {
  return "¡Hola! Soy el Asistente Virtual de Aloba. Puedo ayudarte a buscar propiedades en Guatemala, conocer zonas, rangos de precios o responder tus preguntas. ¿En qué puedo ayudarte?"
}

function formatPrecio(precio: number, moneda: string): string {
  if (moneda === 'USD') {
    return `$${precio.toLocaleString('en-US')}`
  }
  return `Q${precio.toLocaleString('es-GT')}`
}

export async function POST(request: NextRequest) {
  try {
    if (!apiKey) {
      const out = NextResponse.json({ error: "OPENAI_API_KEY ausente.", type: "api_key_missing" }, { status: 503 })
      return withCors(out, request)
    }

    if (!rateLimit(request)) {
      const out = NextResponse.json(
        { error: "Rate limit excedido. Probá de nuevo en unos segundos.", type: "rate_limited" },
        { status: 429 },
      )
      return withCors(out, request)
    }

    const url = new URL(request.url)
    const wantStreamQuery = url.searchParams.get("stream") === "1"

    let bodyRaw: unknown
    try {
      bodyRaw = await request.json()
    } catch {
      const out = NextResponse.json({ error: "Body inválido (JSON requerido).", type: "bad_json" }, { status: 400 })
      return withCors(out, request)
    }

    const validation = requestSchema.safeParse(bodyRaw)
    if (!validation.success) {
      const out = NextResponse.json(
        { error: "Datos de entrada inválidos", details: validation.error.flatten(), type: "invalid_payload" },
        { status: 400 },
      )
      return withCors(out, request)
    }

    const { messages, session, options } = validation.data

    const sessionId = session?.id
    if (session?.reset && sessionId) resetSession(sessionId)
    const prior = getSessionHistory(sessionId) || []
    const extraContext = Array.isArray(session?.context) ? session!.context : undefined

    const temperature = options?.temperature ?? 0.7
    const max_tokens = options?.max_tokens ?? 1000
    const wantStream = wantStreamQuery || !!options?.stream

    const lastUserMsg = messages[messages.length - 1]?.content || ""
    const { isSearch, filters, searchTerms } = detectSearchIntent(lastUserMsg)

    console.log("[CHAT] Search detection:", { isSearch, filters, searchTerms, lastUserMsg: lastUserMsg.substring(0, 50) })

    let inmuebles: InmuebleResult[] = []
    let searchContext = ""

    if (isSearch) {
      inmuebles = await searchInmuebles(filters, 6)
      console.log("[CHAT] Inmuebles found:", inmuebles.length)

      if (inmuebles.length > 0) {
        const displayHint = inmuebles.length === 1
          ? "Menciona que encontraste esta propiedad y que puede ver los detalles debajo."
          : inmuebles.length === 2
            ? "Menciona que encontraste estas propiedades y que puede explorarlas debajo."
            : "Menciona que encontraste estas propiedades y que puede explorar las opciones en el carrusel debajo."

        searchContext = `\n\n[RESULTADOS DE BÚSQUEDA - ${inmuebles.length} propiedad${inmuebles.length > 1 ? 'es' : ''} encontrada${inmuebles.length > 1 ? 's' : ''}]
Las siguientes propiedades están disponibles:
${inmuebles.map((i, idx) => `${idx + 1}. ${i.titulo} - ${formatPrecio(i.precio, i.moneda)} (${i.zona ? `Zona ${i.zona}` : i.ubicacion || 'Guatemala'})`).join("\n")}

IMPORTANTE: ${displayHint} NO inventes información adicional sobre estas propiedades.`
      } else {
        searchContext = "\n\n[SIN RESULTADOS] No se encontraron propiedades con esos criterios. Sugiere al usuario ampliar la búsqueda o contactar por WhatsApp para opciones personalizadas."
      }
    }

    const payload = {
      model: MODEL,
      messages: buildMessages([...prior, ...messages], extraContext, searchContext) as any,
      temperature,
      max_tokens,
    } as const

    const shouldStream = wantStream && inmuebles.length === 0

    if (shouldStream) {
      const completion = await openai.chat.completions.create({ ...payload, stream: true })
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const part of completion) {
              const chunk = part.choices?.[0]?.delta?.content || ""
              if (chunk) controller.enqueue(encoder.encode(chunk))
            }
          } catch (err) {
            controller.error(err)
          } finally {
            controller.close()
          }
        },
      })

      const streamResp = new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Accel-Buffering": "no",
        },
      })
      return withCors(streamResp, request)
    }

    const resp = await openai.chat.completions.create(payload)
    const contentRaw = resp.choices?.[0]?.message?.content || ""
    const content = sanitize(contentRaw) || getSafeDefault()

    if (sessionId) {
      const merged = [...prior, ...messages, { role: "assistant", content }]
      setSessionHistory(sessionId, merged)
      gcSessions()
    }

    const responseData: any = { type: "text", content }
    if (inmuebles.length > 0) {
      responseData.inmuebles = inmuebles
      responseData.searchTerms = searchTerms
    }

    const out = NextResponse.json(responseData)
    return withCors(out, request)
  } catch (error) {
    console.error("[CHAT_BUSINESS_INFO_API_ERROR]", error)
    const out = NextResponse.json(
      { error: "Servicio temporalmente no disponible.", type: "api_error" },
      { status: 503 },
    )
    return withCors(out, request)
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const wantProbe = url.searchParams.get("health") === "1"
  if (!wantProbe) {
    const out = NextResponse.json({ ok: true, endpoint: "/api/chat-business-info" })
    return withCors(out, req)
  }

  const keyOk = !!apiKey && apiKey.startsWith("sk-")
  try {
    if (!keyOk) throw new Error("api_key_missing")
    const r = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "healthcheck" },
        { role: "user", content: "ping" },
      ],
      max_tokens: 1,
      temperature: 0,
    })
    const out = NextResponse.json({
      ok: true,
      model: MODEL,
      keyOk: true,
      probe: r.choices[0]?.finish_reason ?? "ok",
      rateLimit: { rps: RPS, burst: BURST },
      cors: { allowed: ALLOWED_ORIGINS },
      session: { ttl_ms: SESSION_TTL_MS, max_msgs: SESSION_MAX_MSGS },
    })
    return withCors(out, req)
  } catch (e: any) {
    const out = NextResponse.json({ ok: false, keyOk, model: MODEL, error: String(e?.message || e) }, { status: 503 })
    return withCors(out, req)
  }
}
