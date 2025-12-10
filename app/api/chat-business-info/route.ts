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
  precio_usd: number
  precio_gtq: number
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
    venta: [
      { rango: "0-150000", etiqueta: "Hasta $150K", descripcion: "Apartamentos pequeños, terrenos" },
      { rango: "150000-200000", etiqueta: "$150K - $200K", descripcion: "Apartamentos 2 habitaciones" },
      { rango: "200000-250000", etiqueta: "$200K - $250K", descripcion: "Casas y apartamentos amplios" },
      { rango: "250000-300000", etiqueta: "$250K - $300K", descripcion: "Propiedades premium" },
      { rango: "300000-400000", etiqueta: "$300K - $400K", descripcion: "Inmuebles de lujo" },
      { rango: "400000+", etiqueta: "$400K+", descripcion: "Exclusivos y de inversión" },
    ],
    alquiler: [
      { rango: "0-500", etiqueta: "Hasta $500/mes", descripcion: "Habitaciones, estudios pequeños" },
      { rango: "500-1000", etiqueta: "$500 - $1,000/mes", descripcion: "Apartamentos 1-2 habitaciones" },
      { rango: "1000-2000", etiqueta: "$1,000 - $2,000/mes", descripcion: "Apartamentos amplios, casas pequeñas" },
      { rango: "2000-5000", etiqueta: "$2,000 - $5,000/mes", descripcion: "Casas y apartamentos premium" },
      { rango: "5000+", etiqueta: "$5,000+/mes", descripcion: "Propiedades de lujo, ejecutivas" },
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

interface SearchFilters {
  tipo?: string
  zona?: string
  operacion?: string
  habitaciones?: number
  banos?: number
  precioMin?: number
  precioMax?: number
}

const SEARCH_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "buscar_inmuebles",
    description: "Busca inmuebles en la base de datos según los criterios del usuario. Usa esta función cuando el usuario quiera buscar, ver, encontrar propiedades o mencione características de inmuebles que desea.",
    parameters: {
      type: "object",
      properties: {
        debe_buscar: {
          type: "boolean",
          description: "true si el usuario está buscando/pidiendo ver propiedades. false si solo hace preguntas generales o saluda."
        },
        tipo: {
          type: "string",
          enum: ["apartamento", "casa", "terreno", "oficina", "local", "bodega"],
          description: "SOLO incluir si el usuario EXPLÍCITAMENTE menciona el tipo. NO asumir tipo por defecto. 'apartamento' si dice: apartamento, depa, piso, studio, apto. 'casa' si dice: casa, vivienda, residencia, chalet. Si solo menciona habitaciones o zona SIN tipo específico, NO incluir este campo."
        },
        zona: {
          type: "string",
          description: "Número de zona (1-18). Zona 10 = zona viva, oakland. Zona 14 = las américas. Zona 15 = vista hermosa. Zona 16 = cayalá, acatán."
        },
        operacion: {
          type: "string",
          enum: ["venta", "alquiler"],
          description: "SOLO incluir si el usuario lo menciona. venta = comprar, adquirir, invertir. alquiler = rentar, arrendar. Si no especifica, NO incluir."
        },
        habitaciones: {
          type: "number",
          description: "Número de habitaciones/cuartos/recámaras que busca. SOLO si lo menciona explícitamente."
        },
        banos: {
          type: "number",
          description: "Número de baños que busca. SOLO si lo menciona explícitamente."
        },
        precio_minimo: {
          type: "number",
          description: "Precio mínimo en USD. Convierte: 150k=150000, 200mil=200000."
        },
        precio_maximo: {
          type: "number",
          description: "Precio máximo en USD. 'hasta 150k' = precio_maximo 150000. 'que no pase de 200mil' = precio_maximo 200000."
        },
        terminos_busqueda: {
          type: "array",
          items: { type: "string" },
          description: "Lista de términos clave que el usuario REALMENTE mencionó (ej: ['Zona 10', '2 habitaciones', 'Hasta $150,000']). Solo incluir lo que explícitamente dijo."
        }
      },
      required: ["debe_buscar"]
    }
  }
}

async function extractSearchFilters(userMessage: string, conversationContext: string): Promise<{
  isSearch: boolean
  filters: SearchFilters
  searchTerms: string[]
}> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Sos un extractor de intención de búsqueda de inmuebles en Guatemala.
Analizá el mensaje del usuario y determiná si quiere buscar propiedades.

REGLA CRÍTICA: Solo extraé los filtros que el usuario EXPLÍCITAMENTE menciona.
- NO asumas tipo de inmueble si no lo dice (ej: "algo en zona 10" → NO pongas tipo)
- NO asumas operación si no la menciona
- Si dice "casa" o "apartamento" explícitamente, SÍ incluí el tipo
- Si solo dice "2 habitaciones en zona 10" sin mencionar tipo → NO incluyas tipo

Interpretá sinónimos y errores de tipeo:
- "150k", "150mil", "ciento cincuenta mil" = 150000
- "z10", "zona viva", "oakland" = zona "10"
- "que salga hasta", "que no pase de", "máximo" = precio_maximo
- "desde", "mínimo", "a partir de" = precio_minimo

Contexto de la conversación: ${conversationContext}`
        },
        { role: "user", content: userMessage }
      ],
      tools: [SEARCH_TOOL],
      tool_choice: { type: "function", function: { name: "buscar_inmuebles" } },
      temperature: 0.1,
      max_tokens: 500
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments)

      console.log("[CHAT] AI extracted filters:", args)

      const filters: SearchFilters = {}
      if (args.tipo) filters.tipo = args.tipo
      if (args.zona) filters.zona = args.zona
      if (args.operacion) filters.operacion = args.operacion
      if (args.habitaciones) filters.habitaciones = args.habitaciones
      if (args.banos) filters.banos = args.banos
      if (args.precio_minimo) filters.precioMin = args.precio_minimo
      if (args.precio_maximo) filters.precioMax = args.precio_maximo

      return {
        isSearch: args.debe_buscar === true,
        filters,
        searchTerms: args.terminos_busqueda || []
      }
    }

    return { isSearch: false, filters: {}, searchTerms: [] }
  } catch (error) {
    console.error("[CHAT] Error extracting search filters:", error)
    return { isSearch: false, filters: {}, searchTerms: [] }
  }
}

async function searchInmuebles(filters: SearchFilters, limit: number = 12): Promise<InmuebleResult[]> {
  try {
    const conditions: string[] = ["estado = 'disponible'"]
    const params: (string | number)[] = []
    const orderParts: string[] = []

    // Casa y apartamento son intercambiables (ambos son residenciales)
    const residentialTypes = ["casa", "apartamento"]
    if (filters.tipo && residentialTypes.includes(filters.tipo)) {
      // Incluir ambos tipos residenciales, priorizar el pedido
      conditions.push("tipo IN ('casa', 'apartamento')")
      orderParts.push(`(tipo = '${filters.tipo}') DESC`)
    } else if (filters.tipo) {
      // Otros tipos (terreno, oficina, local, bodega) sí filtrar exacto
      conditions.push("tipo = ?")
      params.push(filters.tipo)
    }

    if (filters.zona) {
      orderParts.push(`(zona = '${filters.zona}') DESC`)
    }

    if (filters.operacion) {
      orderParts.push(`(operacion = '${filters.operacion}') DESC`)
    }

    if (filters.habitaciones) {
      orderParts.push(`(habitaciones = ${filters.habitaciones}) DESC`)
      orderParts.push(`ABS(COALESCE(habitaciones, 0) - ${filters.habitaciones}) ASC`)
    }

    if (filters.precioMax) {
      const maxWithMargin = Math.round(filters.precioMax * 1.2)
      conditions.push("precio_usd <= ?")
      params.push(maxWithMargin)
      orderParts.push(`(precio_usd <= ${filters.precioMax}) DESC`)
    }

    if (filters.precioMin) {
      const minWithMargin = Math.round(filters.precioMin * 0.8)
      conditions.push("precio_usd >= ?")
      params.push(minWithMargin)
    }

    orderParts.push("destacado DESC")
    orderParts.push("created_at DESC")

    params.push(limit)

    const orderBy = orderParts.length > 0 ? orderParts.join(", ") : "destacado DESC, created_at DESC"

    const sql = `
      SELECT id, titulo, tipo, operacion, precio_usd, precio_gtq, moneda, ubicacion, zona,
             departamento, metros_cuadrados, habitaciones, banos, parqueos,
             imagen_url, destacado
      FROM inmuebles
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT ?
    `

    console.log("[CHAT] SQL Query:", sql)
    console.log("[CHAT] SQL Params:", params)

    const inmuebles = await query<InmuebleResult>(sql, params)
    console.log("[CHAT] Found inmuebles (flexible):", inmuebles.length)

    return inmuebles
  } catch (error) {
    console.error("[CHAT] Error searching inmuebles:", error)
    return []
  }
}

function filterRelevantInmuebles(
  inmuebles: InmuebleResult[],
  filters: SearchFilters
): InmuebleResult[] {
  if (inmuebles.length === 0) return []
  if (inmuebles.length <= 6) return inmuebles

  // Scoring simple basado en coincidencias
  const scored = inmuebles.map(inmueble => {
    let score = 0

    // Casa y apartamento son equivalentes (residenciales)
    const residentialTypes = ["casa", "apartamento"]
    if (filters.tipo) {
      if (filters.tipo === inmueble.tipo) {
        score += 10 // Coincidencia exacta
      } else if (residentialTypes.includes(filters.tipo) && residentialTypes.includes(inmueble.tipo)) {
        score += 8 // Casa/apartamento son intercambiables
      }
    }

    // Zona exacta
    if (filters.zona && inmueble.zona === filters.zona) {
      score += 10
    }

    // Habitaciones (exacto o +1)
    if (filters.habitaciones && inmueble.habitaciones) {
      if (inmueble.habitaciones === filters.habitaciones) {
        score += 8
      } else if (inmueble.habitaciones === filters.habitaciones + 1) {
        score += 5
      } else if (Math.abs(inmueble.habitaciones - filters.habitaciones) <= 1) {
        score += 3
      }
    }

    // Precio dentro del rango
    if (filters.precioMax && inmueble.precio_usd <= filters.precioMax) {
      score += 8
    } else if (filters.precioMax && inmueble.precio_usd <= filters.precioMax * 1.15) {
      score += 4 // Hasta 15% más caro
    }

    // Operación
    if (filters.operacion && inmueble.operacion === filters.operacion) {
      score += 5
    }

    // Destacado como bonus
    if (inmueble.destacado) {
      score += 2
    }

    return { inmueble, score }
  })

  // Ordenar por score y tomar los mejores 6
  scored.sort((a, b) => b.score - a.score)
  const filtered = scored.slice(0, 6).map(s => s.inmueble)

  console.log("[CHAT] Score filtered:", inmuebles.length, "->", filtered.length)
  return filtered
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
- Rangos de precios: Venta desde $150K hasta $400K+ USD | Alquiler desde $500 hasta $5,000+/mes
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
- Proyectos: https://marketplaceinmobiliario.com/proyectos

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

function formatPrecio(precioUsd: number, precioGtq: number, moneda: string): string {
  if (moneda === 'USD') {
    return `$${precioUsd.toLocaleString('en-US')}`
  }
  return `Q${precioGtq.toLocaleString('es-GT')}`
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

    const conversationContext = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n")
    const { isSearch, filters, searchTerms } = await extractSearchFilters(lastUserMsg, conversationContext)

    console.log("[CHAT] AI Search detection:", { isSearch, filters, searchTerms, lastUserMsg: lastUserMsg.substring(0, 80) })

    let inmuebles: InmuebleResult[] = []
    let searchContext = ""

    if (isSearch && Object.keys(filters).length > 0) {
      const allInmuebles = await searchInmuebles(filters, 15)
      inmuebles = filterRelevantInmuebles(allInmuebles, filters)
      console.log("[CHAT] Inmuebles found:", allInmuebles.length, "-> filtered:", inmuebles.length)

      const appliedFilters: string[] = []
      if (filters.tipo) appliedFilters.push(`Tipo: ${filters.tipo}`)
      if (filters.zona) appliedFilters.push(`Zona: ${filters.zona}`)
      if (filters.operacion) appliedFilters.push(`Operación: ${filters.operacion}`)
      if (filters.habitaciones) appliedFilters.push(`Habitaciones: ${filters.habitaciones}`)
      if (filters.banos) appliedFilters.push(`Baños: ${filters.banos}`)
      if (filters.precioMin) appliedFilters.push(`Precio mín: $${filters.precioMin.toLocaleString()}`)
      if (filters.precioMax) appliedFilters.push(`Precio máx: $${filters.precioMax.toLocaleString()}`)

      if (inmuebles.length > 0) {
        const displayHint = inmuebles.length === 1
          ? "Menciona que encontraste esta propiedad que coincide con lo que busca y que puede ver los detalles debajo."
          : inmuebles.length === 2
            ? "Menciona que encontraste estas propiedades que coinciden con su búsqueda y que puede explorarlas debajo."
            : `Menciona que encontraste ${inmuebles.length} propiedades que coinciden con su búsqueda y que puede explorar las opciones en el carrusel debajo.`

        searchContext = `\n\n[RESULTADOS DE BÚSQUEDA]
Filtros aplicados: ${appliedFilters.join(", ")}
Se encontraron ${inmuebles.length} propiedad(es):
${inmuebles.map((i, idx) => `${idx + 1}. ${i.titulo} - ${formatPrecio(i.precio_usd, i.precio_gtq, i.moneda)} - ${i.tipo} - ${i.habitaciones || 0} hab - ${i.zona ? `Zona ${i.zona}` : i.ubicacion || 'Guatemala'}`).join("\n")}

IMPORTANTE: ${displayHint} Estas propiedades YA coinciden con los filtros del usuario. NO digas que no hay resultados si ves propiedades listadas arriba.`
      } else {
        searchContext = `\n\n[SIN RESULTADOS]
Filtros buscados: ${appliedFilters.join(", ")}
No se encontraron propiedades con TODOS esos criterios exactos.

IMPORTANTE: Informá al usuario que no encontraste propiedades con esos criterios específicos (mencioná los filtros). Sugerí:
1. Ampliar el rango de precio
2. Considerar otras zonas cercanas
3. Ajustar el número de habitaciones
4. Contactar por WhatsApp (+502 3000 0000) para opciones personalizadas

NO muestres ni menciones un carrusel porque no hay resultados.`
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
