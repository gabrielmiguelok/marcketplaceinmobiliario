// app/api/chat-business-info/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import OpenAI from "openai"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"

/**
 * ============================================================
 * Tipos para búsqueda de doctores
 * ============================================================
 */
interface DoctorResult {
  id: number
  usuario: string
  full_name: string
  first_name: string | null
  last_name: string | null
  picture: string | null
  especialidad: string | null
  direccion_consultorio: string | null
  anos_experiencia: number | null
  pacientes_atendidos: number | null
}

/**
 * ============================================================
 * Infra y Config (superficie pública estable para clientes externos)
 * ============================================================
 */

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

/**
 * ============================================================
 * Programa Canónico (DOCTOP) — curado y normalizado
 * ============================================================
 */
const DOCTOP = {
  nombre: "DocTop",
  descripcion: "Plataforma médica líder en México que conecta pacientes con profesionales de la salud verificados",
  lema: "Encuentra tu especialista y agenda tu consulta de forma segura.",
  url: "https://doctop.space",

  servicios: {
    principal: "Búsqueda y conexión con médicos verificados",
    para_pacientes: [
      "Búsqueda de médicos por especialidad",
      "Filtro por ubicación y disponibilidad",
      "Perfiles completos con foto, experiencia y valoraciones",
      "Contacto directo por WhatsApp",
      "Verificación profesional de todos los médicos",
      "Servicio gratuito para pacientes",
    ],
    para_medicos: [
      "Perfil profesional en la plataforma",
      "Visibilidad en búsquedas de pacientes",
      "Contacto directo sin intermediarios",
      "Badge de médico verificado",
      "Sin comisiones por consulta",
      "Plan gratuito disponible",
    ],
  },

  como_funciona: {
    descripcion: "Proceso simple para encontrar tu médico ideal",
    pasos_paciente: [
      {
        numero: 1,
        nombre: "Busca",
        descripcion: "Encuentra médicos por especialidad, nombre o ubicación",
      },
      {
        numero: 2,
        nombre: "Revisa",
        descripcion: "Consulta perfiles con foto, experiencia y valoraciones",
      },
      {
        numero: 3,
        nombre: "Contacta",
        descripcion: "Comunícate directamente por WhatsApp",
      },
      {
        numero: 4,
        nombre: "Agenda",
        descripcion: "Coordina tu cita con el médico",
      },
    ],
    pasos_medico: [
      {
        numero: 1,
        nombre: "Regístrate",
        descripcion: "Crea tu cuenta con Google",
      },
      {
        numero: 2,
        nombre: "Completa tu perfil",
        descripcion: "Agrega tu especialidad, experiencia y foto",
      },
      {
        numero: 3,
        nombre: "Verifica",
        descripcion: "Obtén tu badge de médico verificado",
      },
      {
        numero: 4,
        nombre: "Recibe pacientes",
        descripcion: "Los pacientes te encontrarán y contactarán",
      },
    ],
  },

  especialidades: {
    descripcion: "Diversas especialidades médicas disponibles",
    lista: [
      "Medicina General",
      "Cardiología",
      "Dermatología",
      "Ortopedia",
      "Pediatría",
      "Ginecología",
      "Neurología",
      "Oftalmología",
      "Otorrinolaringología",
      "Urología",
      "Gastroenterología",
      "Psiquiatría",
      "Y muchas más...",
    ],
  },

  planes: {
    descripcion: "Planes flexibles para médicos",
    basico: {
      nombre: "Plan Básico",
      precio: "Gratis",
      caracteristicas: [
        "Perfil profesional básico",
        "Contacto por WhatsApp",
        "Aparecer en búsquedas",
      ],
    },
    premium: {
      nombre: "Plan Premium",
      precio: "Consultar",
      caracteristicas: [
        "Todo lo del plan básico",
        "Perfil destacado en búsquedas",
        "Badge verificado premium",
        "Estadísticas de visitas",
        "Soporte prioritario",
      ],
    },
  },

  estadisticas: {
    medicos: "15,000+",
    pacientes: "500,000+",
    valoracion: "4.9",
    descripcion: "La plataforma médica de mayor confianza en México",
  },

  nosotros: {
    filosofia: "Conectamos profesionales de la salud verificados con pacientes en toda México",
    valores: [
      { valor: "Confianza", descripcion: "Todos los médicos son verificados profesionalmente" },
      { valor: "Accesibilidad", descripcion: "Servicio gratuito para pacientes" },
      { valor: "Transparencia", descripcion: "Perfiles completos con toda la información" },
      { valor: "Seguridad", descripcion: "Datos protegidos y comunicación segura" },
    ],
    caracteristicas: [
      "Verificación profesional de médicos",
      "Plataforma moderna y fácil de usar",
      "Soporte en español 24/7",
      "Presente en todo México",
    ],
  },

  faq: {
    preguntas: [
      {
        pregunta: "¿Cómo busco un médico?",
        respuesta:
          "Usa el buscador en la página principal. Puedes buscar por especialidad, nombre del médico o ubicación. Todos los resultados muestran médicos verificados con perfiles completos.",
      },
      {
        pregunta: "¿Es gratis para pacientes?",
        respuesta:
          "Sí, DocTop es completamente gratis para pacientes. Puedes buscar médicos, ver perfiles y contactarlos sin ningún costo.",
      },
      {
        pregunta: "¿Cómo contacto a un médico?",
        respuesta:
          "Cada perfil de médico tiene un botón de WhatsApp para contacto directo. También puedes ver su dirección de consultorio y otros datos de contacto.",
      },
      {
        pregunta: "¿Los médicos están verificados?",
        respuesta:
          "Sí, todos los médicos en DocTop pasan por un proceso de verificación profesional. Verificamos su cédula profesional y datos de contacto.",
      },
      {
        pregunta: "Soy médico, ¿cómo me registro?",
        respuesta:
          "Haz clic en 'Registrarse' e inicia sesión con Google. Luego completa tu perfil con tu especialidad, experiencia y foto profesional. El registro básico es gratuito.",
      },
      {
        pregunta: "¿Cuánto cuesta para médicos?",
        respuesta:
          "Ofrecemos un plan básico gratuito y un plan premium con beneficios adicionales. Contacta con nosotros para conocer los precios del plan premium.",
      },
    ],
  },

  contacto: {
    email: "contacto@doctop.space",
    whatsapp: "https://wa.me/5492364655702",
    whatsapp_numero: "+54 9 236 465 5702",
    ubicacion: "Argentina",
    horario: "Lunes a Viernes: 9:00 - 18:00 hrs, Sábados: 10:00 - 14:00 hrs",
    respuesta: "Respuesta en menos de 24 horas",
  },
}

/**
 * ============================================================
 * Herramientas de interpretación y selección canónica
 * ============================================================
 */
function norm(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * ============================================================
 * Detección de intención de búsqueda de médicos (MEJORADA)
 * ============================================================
 */

// Mapeo completo de síntomas/condiciones/términos a especialidades
const SYMPTOM_TO_SPECIALTY: Record<string, string> = {
  // DERMATOLOGÍA - términos muy amplios
  "piel": "dermatología",
  "acne": "dermatología",
  "acné": "dermatología",
  "granos": "dermatología",
  "espinillas": "dermatología",
  "manchas": "dermatología",
  "arrugas": "dermatología",
  "dermato": "dermatología",
  "derma": "dermatología",
  "cutane": "dermatología",
  "erupcion": "dermatología",
  "sarpullido": "dermatología",
  "picazon": "dermatología",
  "comezon": "dermatología",
  "eczema": "dermatología",
  "psoriasis": "dermatología",
  "verruga": "dermatología",
  "lunar": "dermatología",
  "caida del cabello": "dermatología",
  "alopecia": "dermatología",
  "calvicie": "dermatología",
  "cabello": "dermatología",
  "caspa": "dermatología",
  "rojez": "dermatología",
  "irritacion piel": "dermatología",
  "cuero cabelludo": "dermatología",
  "belleza facial": "dermatología",
  "estetico": "dermatología",
  "estetic": "dermatología",

  // CARDIOLOGÍA
  "corazon": "cardiología",
  "cardio": "cardiología",
  "pecho": "cardiología",
  "dolor de pecho": "cardiología",
  "presion arterial": "cardiología",
  "hipertension": "cardiología",
  "arritmia": "cardiología",
  "taquicardia": "cardiología",
  "infarto": "cardiología",
  "colesterol": "cardiología",
  "palpitaciones": "cardiología",

  // TRAUMATOLOGÍA / ORTOPEDIA
  "huesos": "traumatología",
  "hueso": "traumatología",
  "articulaciones": "traumatología",
  "articulacion": "traumatología",
  "rodilla": "traumatología",
  "rodillas": "traumatología",
  "fractura": "traumatología",
  "esguince": "traumatología",
  "espalda": "traumatología",
  "columna": "traumatología",
  "lumbar": "traumatología",
  "ciatica": "traumatología",
  "lumbalgia": "traumatología",
  "tobillo": "traumatología",
  "cadera": "traumatología",
  "hombro": "traumatología",
  "tendinitis": "traumatología",
  "artritis": "traumatología",
  "artrosis": "traumatología",
  "menisco": "traumatología",
  "ligamento": "traumatología",

  // NEUROLOGÍA
  "cabeza": "neurología",
  "dolor de cabeza": "neurología",
  "migraña": "neurología",
  "migrana": "neurología",
  "jaqueca": "neurología",
  "vertigo": "neurología",
  "mareo": "neurología",
  "convulsion": "neurología",
  "epilepsia": "neurología",
  "temblor": "neurología",
  "parkinson": "neurología",
  "alzheimer": "neurología",
  "memoria": "neurología",
  "olvidos": "neurología",
  "hormigueo": "neurología",
  "adormecimiento": "neurología",
  "nervios": "neurología",

  // GASTROENTEROLOGÍA
  "estomago": "gastroenterología",
  "digestion": "gastroenterología",
  "digestivo": "gastroenterología",
  "gastritis": "gastroenterología",
  "colitis": "gastroenterología",
  "reflujo": "gastroenterología",
  "acidez": "gastroenterología",
  "nauseas": "gastroenterología",
  "vomito": "gastroenterología",
  "diarrea": "gastroenterología",
  "estreñimiento": "gastroenterología",
  "estrenimiento": "gastroenterología",
  "intestino": "gastroenterología",
  "colon": "gastroenterología",
  "higado": "gastroenterología",
  "pancreas": "gastroenterología",
  "hepatitis": "gastroenterología",
  "hemorroides": "gastroenterología",

  // GINECOLOGÍA
  "gineco": "ginecología",
  "mujer": "ginecología",
  "femenino": "ginecología",
  "femenina": "ginecología",
  "menstruacion": "ginecología",
  "periodo": "ginecología",
  "menopausia": "ginecología",
  "embarazo": "ginecología",
  "embarazada": "ginecología",
  "prenatal": "ginecología",
  "matriz": "ginecología",
  "utero": "ginecología",
  "ovarios": "ginecología",
  "papanicolau": "ginecología",
  "anticonceptivo": "ginecología",
  "fertilidad": "ginecología",

  // PEDIATRÍA
  "niño": "pediatría",
  "niña": "pediatría",
  "nino": "pediatría",
  "nina": "pediatría",
  "bebe": "pediatría",
  "bebé": "pediatría",
  "hijo": "pediatría",
  "hija": "pediatría",
  "infancia": "pediatría",
  "infantil": "pediatría",
  "recien nacido": "pediatría",
  "vacunas": "pediatría",

  // UROLOGÍA
  "orina": "urología",
  "orinar": "urología",
  "rinon": "urología",
  "riñon": "urología",
  "riñones": "urología",
  "prostata": "urología",
  "vejiga": "urología",
  "infeccion urinaria": "urología",
  "calculos": "urología",
  "piedras en el riñon": "urología",
  "incontinencia": "urología",

  // OFTALMOLOGÍA
  "ojos": "oftalmología",
  "ojo": "oftalmología",
  "vista": "oftalmología",
  "vision": "oftalmología",
  "ver": "oftalmología",
  "lentes": "oftalmología",
  "catarata": "oftalmología",
  "glaucoma": "oftalmología",
  "miopia": "oftalmología",
  "astigmatismo": "oftalmología",
  "conjuntivitis": "oftalmología",

  // OTORRINOLARINGOLOGÍA
  "oido": "otorrinolaringología",
  "oidos": "otorrinolaringología",
  "nariz": "otorrinolaringología",
  "garganta": "otorrinolaringología",
  "sinusitis": "otorrinolaringología",
  "amigdalas": "otorrinolaringología",
  "sordera": "otorrinolaringología",
  "zumbido": "otorrinolaringología",
  "ronquido": "otorrinolaringología",
  "rinitis": "otorrinolaringología",
  "alergia nasal": "otorrinolaringología",

  // ENDOCRINOLOGÍA
  "diabetes": "endocrinología",
  "diabetico": "endocrinología",
  "tiroides": "endocrinología",
  "hormona": "endocrinología",
  "hormonas": "endocrinología",
  "metabolismo": "endocrinología",
  "obesidad": "endocrinología",
  "sobrepeso": "endocrinología",
  "insulina": "endocrinología",

  // PSIQUIATRÍA / PSICOLOGÍA
  "ansiedad": "psiquiatría",
  "depresion": "psiquiatría",
  "deprimido": "psiquiatría",
  "estres": "psiquiatría",
  "insomnio": "psiquiatría",
  "dormir": "psiquiatría",
  "sueño": "psiquiatría",
  "panico": "psiquiatría",
  "fobia": "psiquiatría",
  "mental": "psiquiatría",
  "emocional": "psiquiatría",
  "trastorno": "psiquiatría",
  "bipolar": "psiquiatría",
  "esquizofrenia": "psiquiatría",
  "adiccion": "psiquiatría",

  // NEUMOLOGÍA
  "pulmon": "neumología",
  "pulmones": "neumología",
  "respirar": "neumología",
  "respiracion": "neumología",
  "asma": "neumología",
  "tos": "neumología",
  "bronquitis": "neumología",
  "neumonia": "neumología",
  "falta de aire": "neumología",

  // ONCOLOGÍA
  "cancer": "oncología",
  "tumor": "oncología",
  "quimioterapia": "oncología",
  "oncologico": "oncología",

  // REUMATOLOGÍA
  "reuma": "reumatología",
  "reumatico": "reumatología",
  "lupus": "reumatología",
  "fibromialgia": "reumatología",
  "gota": "reumatología",

  // ALERGIA / INMUNOLOGÍA
  "alergia": "alergología",
  "alergico": "alergología",
  "alergias": "alergología",
  "urticaria": "alergología",
}

// Mapeo de especialidades (nombre directo)
const SPECIALTY_NAMES: Record<string, string> = {
  "cardiologo": "cardiología",
  "cardiologia": "cardiología",
  "cardiologa": "cardiología",
  "dermatologo": "dermatología",
  "dermatologa": "dermatología",
  "dermatologia": "dermatología",
  "dermatologico": "dermatología",
  "dermatologica": "dermatología",
  "pediatra": "pediatría",
  "pediatria": "pediatría",
  "ginecologo": "ginecología",
  "ginecologa": "ginecología",
  "ginecologia": "ginecología",
  "ginecologico": "ginecología",
  "ginecologica": "ginecología",
  "traumatologo": "traumatología",
  "traumatologia": "traumatología",
  "ortopedista": "ortopedia",
  "ortopedia": "ortopedia",
  "neurologo": "neurología",
  "neurologa": "neurología",
  "neurologia": "neurología",
  "neurologico": "neurología",
  "neurologica": "neurología",
  "psicologo": "psicología",
  "psicologa": "psicología",
  "psicologia": "psicología",
  "psicologico": "psicología",
  "psicologica": "psicología",
  "psiquiatra": "psiquiatría",
  "psiquiatria": "psiquiatría",
  "oftalmologo": "oftalmología",
  "oftalmologa": "oftalmología",
  "oftalmologia": "oftalmología",
  "oculista": "oftalmología",
  "otorrino": "otorrinolaringología",
  "otorrinolaringologo": "otorrinolaringología",
  "urologo": "urología",
  "urologa": "urología",
  "urologia": "urología",
  "urologico": "urología",
  "urologica": "urología",
  "gastroenterologo": "gastroenterología",
  "gastroenterologa": "gastroenterología",
  "gastroenterologia": "gastroenterología",
  "endocrinologo": "endocrinología",
  "endocrinologa": "endocrinología",
  "endocrinologia": "endocrinología",
  "reumatologo": "reumatología",
  "reumatologa": "reumatología",
  "reumatologia": "reumatología",
  "nefrologo": "nefrología",
  "nefrologa": "nefrología",
  "nefrologia": "nefrología",
  "oncologo": "oncología",
  "oncologa": "oncología",
  "oncologia": "oncología",
  "cirujano": "cirugía",
  "cirujana": "cirugía",
  "cirugia": "cirugía",
  "quirurgico": "cirugía",
  "quirurgica": "cirugía",
  "internista": "medicina interna",
  "medicina general": "medicina general",
  "medicina interna": "medicina interna",
  "general": "medicina general",
  "neumologo": "neumología",
  "neumologa": "neumología",
  "neumologia": "neumología",
  "alergologo": "alergología",
  "alergologa": "alergología",
  "alergologia": "alergología",
}

// Patrones de búsqueda más flexibles
const SEARCH_PATTERNS = [
  // Patrones directos
  /busco?\s+(un|una|al)?\s*(medico|doctor|especialista)/i,
  /necesito\s+(un|una|ver|una?\s*cita|una?\s*consulta)/i,
  /quiero\s+(un|una|ver|una?\s*cita|una?\s*consulta|agendar)/i,
  /donde\s+(encuentro|hay|puedo)\s*(medico|doctor|especialista)?/i,
  /recomiend[ae]n?\s+(un|una)?\s*(medico|doctor|especialista)?/i,
  /tiene[ns]?\s+(medico|doctor|especialista)/i,
  /hay\s+(algun|alguna)?\s*(medico|doctor|especialista)?/i,
  // Patrones de consulta médica
  /consulta\s+(de\s+|con\s+)?\w+/i,
  /cita\s+(con|de|medica|para)/i,
  /atencion\s+(medica|de)/i,
  /problema\s*(de|con|en)\s*(la|el|mi|mis)?\s*\w+/i,
  /tengo\s+(problemas?|dolor|molestia)/i,
  /me\s+duele/i,
  /padezco/i,
  /sufro\s+de/i,
]

// Palabras que indican intención de búsqueda médica
const MEDICAL_INTENT_WORDS = [
  "consulta", "cita", "turno", "atencion", "ver", "visitar",
  "medico", "doctor", "doctora", "especialista", "profesional",
  "tratamiento", "revisar", "chequeo", "estudio", "analisis",
  "problema", "dolor", "molestia", "sintoma", "enfermedad",
  "padecimiento", "condicion", "diagnostico", "receta"
]

function detectSearchIntent(text: string): { isSearch: boolean; searchTerms: string[] } {
  const normalized = norm(text)
  const searchTerms: string[] = []

  // 1. Buscar especialidades directamente mencionadas
  for (const [key, value] of Object.entries(SPECIALTY_NAMES)) {
    if (normalized.includes(key) && !searchTerms.includes(value)) {
      searchTerms.push(value)
    }
  }

  // 2. Buscar síntomas/condiciones que mapean a especialidades
  for (const [symptom, specialty] of Object.entries(SYMPTOM_TO_SPECIALTY)) {
    if (normalized.includes(symptom) && !searchTerms.includes(specialty)) {
      searchTerms.push(specialty)
    }
  }

  // 3. Verificar patrones de búsqueda
  const matchesPattern = SEARCH_PATTERNS.some(pattern => pattern.test(text))

  // 4. Verificar palabras de intención médica
  const medicalIntentCount = MEDICAL_INTENT_WORDS.filter(word => normalized.includes(word)).length

  // Determinar si es una búsqueda:
  // - Si encontramos especialidades/síntomas
  // - Si hay patrón de búsqueda + alguna palabra médica
  // - Si hay 2+ palabras de intención médica
  const isSearch =
    searchTerms.length > 0 ||
    (matchesPattern && medicalIntentCount >= 1) ||
    medicalIntentCount >= 2

  // Si no encontramos términos específicos pero detectamos intención de búsqueda,
  // usar "medicina general" como fallback
  if (isSearch && searchTerms.length === 0) {
    // Solo si realmente parece una búsqueda médica
    const hasMedicalContext = medicalIntentCount >= 1 || matchesPattern
    if (hasMedicalContext) {
      // No agregamos término, dejamos que muestre todos los doctores
    }
  }

  console.log("[CHAT] detectSearchIntent:", {
    normalized: normalized.substring(0, 60),
    searchTerms,
    matchesPattern,
    medicalIntentCount,
    isSearch
  })

  return { isSearch, searchTerms: [...new Set(searchTerms)] }
}

/**
 * ============================================================
 * Búsqueda de doctores en la base de datos
 * ============================================================
 */
async function searchDoctors(searchTerms: string[], limit: number = 6): Promise<DoctorResult[]> {
  try {
    if (searchTerms.length === 0) {
      // Sin términos específicos, devolver doctores destacados
      const doctors = await query<DoctorResult>(
        `SELECT id, usuario, full_name, first_name, last_name, picture,
                especialidad, direccion_consultorio, anos_experiencia, pacientes_atendidos
         FROM users
         WHERE role = 'doctor' AND estado = 'confirmado' AND usuario IS NOT NULL
         ORDER BY pacientes_atendidos DESC, anos_experiencia DESC
         LIMIT ?`,
        [limit]
      )
      return doctors
    }

    // Construir query con múltiples términos de búsqueda
    const conditions = searchTerms.map(() =>
      `(especialidad LIKE ? OR bio LIKE ? OR full_name LIKE ?)`
    ).join(" OR ")

    const params: (string | number)[] = []
    for (const term of searchTerms) {
      const searchTerm = `%${term}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    params.push(limit)

    const doctors = await query<DoctorResult>(
      `SELECT id, usuario, full_name, first_name, last_name, picture,
              especialidad, direccion_consultorio, anos_experiencia, pacientes_atendidos
       FROM users
       WHERE role = 'doctor' AND estado = 'confirmado' AND usuario IS NOT NULL
         AND (${conditions})
       ORDER BY
         CASE
           WHEN especialidad LIKE ? THEN 1
           ELSE 2
         END,
         pacientes_atendidos DESC
       LIMIT ?`,
      [...params.slice(0, -1), `%${searchTerms[0]}%`, limit]
    )

    return doctors
  } catch (error) {
    console.error("[CHAT] Error searching doctors:", error)
    return []
  }
}

function pickCanonSubset(lastUser: string) {
  const n = norm(lastUser || "")

  const servicioKeywords = ["servicio", "buscar", "medico", "doctor", "especialista", "consulta", "cita", "paciente"]
  const comoKeywords = ["como", "cómo", "funciona", "proceso", "pasos", "agendar", "registrar"]
  const especialidadKeywords = ["especialidad", "especialidades", "cardiologia", "dermatologia", "pediatria", "ortopedia", "medicina"]
  const planesKeywords = ["plan", "planes", "precio", "costo", "gratis", "premium", "pagar"]
  const nosotrosKeywords = ["nosotros", "sobre", "empresa", "quienes", "DocTop", "plataforma"]
  const contactoKeywords = ["contacto", "telefono", "whatsapp", "email", "correo", "hablar", "comunicar"]
  const faqKeywords = ["pregunta", "faq", "duda", "ayuda", "informacion", "saber"]

  const wantsServicio = servicioKeywords.some((k) => n.includes(k))
  const wantsComo = comoKeywords.some((k) => n.includes(k))
  const wantsEspecialidad = especialidadKeywords.some((k) => n.includes(k))
  const wantsPlanes = planesKeywords.some((k) => n.includes(k))
  const wantsNosotros = nosotrosKeywords.some((k) => n.includes(k))
  const wantsContacto = contactoKeywords.some((k) => n.includes(k))
  const wantsFaq = faqKeywords.some((k) => n.includes(k))

  const subset: any = {
    nombre: DOCTOP.nombre,
    descripcion: DOCTOP.descripcion,
    lema: DOCTOP.lema,
    url: DOCTOP.url,
    estadisticas: DOCTOP.estadisticas,
  }

  if (wantsServicio) subset.servicios = DOCTOP.servicios
  if (wantsComo) subset.como_funciona = DOCTOP.como_funciona
  if (wantsEspecialidad) subset.especialidades = DOCTOP.especialidades
  if (wantsPlanes) subset.planes = DOCTOP.planes
  if (wantsNosotros) subset.nosotros = DOCTOP.nosotros
  if (wantsContacto) subset.contacto = DOCTOP.contacto
  if (wantsFaq) subset.faq = DOCTOP.faq

  if (!wantsServicio && !wantsComo && !wantsEspecialidad && !wantsPlanes && !wantsNosotros && !wantsContacto && !wantsFaq) {
    return DOCTOP
  }

  return subset
}

/**
 * ============================================================
 * Estilo y continuidad (CORE)
 * ============================================================
 */
const CORE = `
Sos el Asistente Virtual de DocTop. Hablás profesional pero cercano, especializado en ayudar a pacientes a encontrar médicos y a médicos a registrarse en la plataforma.

**Lo que SÍ sabés (y podés hablar):**
- Servicios: Búsqueda de médicos, perfiles verificados, contacto directo por WhatsApp
- Cómo funciona: Para pacientes (buscar, revisar, contactar, agendar) y para médicos (registrar, completar perfil, verificar, recibir pacientes)
- Especialidades: Medicina general, cardiología, dermatología, ortopedia, pediatría, ginecología, neurología, y más
- Planes: Plan básico gratuito y plan premium para médicos
- Estadísticas: 15,000+ médicos, 500,000+ pacientes, valoración 4.9
- Nosotros: Plataforma médica líder en México, verificación profesional
- Contacto: contacto@doctop.space, [WhatsApp](https://wa.me/5492364655702), Argentina
- FAQ: Preguntas frecuentes sobre búsqueda, registro, verificación, costos

**Lo que NO sabés:**
- Precios específicos del plan premium (derivá a contacto)
- Diagnósticos médicos o consejos de salud específicos
- Información de médicos específicos (derivá a buscar en la plataforma)
- Temas fuera de DocTop

**Reglas de longitud de respuesta (FLEXIBLE):**
1. **Respuestas concisas (60-80 palabras, 2-3 oraciones)** para:
   - Preguntas simples y directas ("¿Qué es DocTop?", "¿Es gratis?")
   - Saludos iniciales
   - Confirmaciones rápidas

2. **Respuestas amplias (150-200 palabras, 4-6 oraciones)** cuando:
   - El usuario solicita más detalles explícitamente ("cuéntame más", "explícame mejor")
   - Preguntas complejas que requieren contexto ("¿Cómo funciona para médicos?")
   - El usuario pregunta sobre múltiples temas a la vez
   - Se necesita explicar procesos paso a paso

3. **Siempre:**
   - Respondé directo a la pregunta, sin rodeos
   - Usá **negritas** para datos clave (ej: **15,000+ médicos**, **gratis para pacientes**, **verificados**)
   - Usá [hipervínculos en markdown](url) para WhatsApp y links importantes
   - Sin bullets ni listas excesivas - hablá natural
   - Profesional pero cercano y amigable
   - Cerrá con UNA pregunta corta SOLO sobre temas que SÍ sabés

**REGLA CRÍTICA SOBRE URLs:**
- SIEMPRE usá las URLs EXACTAS del contexto JSON sin modificarlas
- NO acortes, NO cambies, NO inventes URLs
- WhatsApp: https://wa.me/5492364655702
- Web: https://doctop.space

**Ejemplos de hipervínculos CORRECTOS:**
- "Podés [contactarnos por WhatsApp](https://wa.me/5492364655702) ahora mismo"
- "Registrate gratis en [DocTop](https://doctop.space)"
- "Visitá nuestra [página principal](https://doctop.space) para buscar médicos"

**Tu estilo:**
❌ "DocTop es una innovadora plataforma..."
✅ "DocTop conecta pacientes con **médicos verificados** en todo México"

❌ "Te invito a explorar nuestros servicios..."
✅ "Buscá médicos por especialidad en nuestra plataforma, es **gratis para pacientes**. ¿Qué especialidad necesitás?"

❌ "¿Te gustaría saber sobre diagnósticos?" (no sabés de medicina)
✅ "¿Te ayudo a buscar un especialista o tenés dudas sobre cómo registrarte?" (sí sabés)

Hablá como un asistente de servicio al cliente amigable que conoce perfectamente la plataforma DocTop.
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

  // Si hay contexto de búsqueda, agregarlo
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
        ? "El usuario está buscando médicos. Presenta los resultados de forma amigable y menciona que puede ver los perfiles debajo. NO cierres con pregunta, solo confirma la búsqueda."
        : "Cerrá SIEMPRE con una pregunta corta sobre algo que SÍ está en tu contexto: buscar médicos, registrarse, especialidades, planes o contacto. NO sugieras temas médicos que no conocés.",
    },
  ]
}

const requestSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) })).min(1),
  topic: z.string().optional(),
  category: z.string().optional(),
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
      system_overrides: z.string().optional(),
      stream: z.boolean().optional(),
      model: z.string().optional(),
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
  return "¡Hola! Soy el Asistente Virtual de DocTop. Puedo ayudarte a buscar médicos, conocer cómo funciona la plataforma, o responder tus preguntas. ¿En qué puedo ayudarte?"
}

/**
 * ============================================================
 * POST (stream opcional) — **Superficie pública estable**
 * ============================================================
 */
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
    const model = options?.model || MODEL
    const wantStream = wantStreamQuery || !!options?.stream

    // Detectar intención de búsqueda en el último mensaje del usuario
    const lastUserMsg = messages[messages.length - 1]?.content || ""
    const { isSearch, searchTerms } = detectSearchIntent(lastUserMsg)

    console.log("[CHAT] Search detection:", { isSearch, searchTerms, lastUserMsg: lastUserMsg.substring(0, 50) })

    // Si es una búsqueda, buscar doctores y generar respuesta contextual
    let doctors: DoctorResult[] = []
    let searchContext = ""

    if (isSearch) {
      doctors = await searchDoctors(searchTerms, 6)
      console.log("[CHAT] Doctors found:", doctors.length)

      if (doctors.length > 0) {
        const displayHint = doctors.length === 1
          ? "Menciona que encontraste este médico y que puede ver su perfil debajo."
          : doctors.length === 2
            ? "Menciona que encontraste estos médicos y que puede ver sus perfiles debajo."
            : "Menciona que encontraste estos médicos y que puede explorar los perfiles en el carrusel debajo."

        searchContext = `\n\n[RESULTADOS DE BÚSQUEDA - ${doctors.length} médico${doctors.length > 1 ? 's' : ''} encontrado${doctors.length > 1 ? 's' : ''}]
Los siguientes médicos están disponibles en la plataforma:
${doctors.map((d, i) => `${i + 1}. ${d.full_name} - ${d.especialidad || "Medicina General"} (${d.direccion_consultorio?.split(",")[0] || "México"})`).join("\n")}

IMPORTANTE: ${displayHint} NO inventes información adicional sobre estos doctores.`
      } else {
        searchContext = "\n\n[SIN RESULTADOS] No se encontraron médicos con esos criterios. Sugiere al usuario usar términos más amplios o contactar por WhatsApp."
      }
    }

    const payload = {
      model,
      messages: buildMessages([...prior, ...messages], extraContext, searchContext) as any,
      temperature,
      max_tokens,
    } as const

    // Si hay doctores encontrados, NO usar streaming para poder incluirlos en la respuesta JSON
    const shouldStream = wantStream && doctors.length === 0

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

    // Incluir doctores en la respuesta si hubo búsqueda
    const responseData: any = { type: "text", content }
    if (doctors.length > 0) {
      responseData.doctors = doctors
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

/**
 * ============================================================
 * GET (health)
 * ============================================================
 */
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
