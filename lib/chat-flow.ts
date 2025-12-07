import type { LucideIcon } from "lucide-react"
import { Search, Home, MapPin, DollarSign, MessageCircle, Building2, Key, HelpCircle } from "lucide-react"

export type ChatOption = {
  key: string
  label: string
  description?: string
  icon?: LucideIcon
  nextStep: string
}

export type ChatStep = {
  assistantMessages: Array<string | ((user: any) => string)>
  options?: ChatOption[]
  viewMode?: "conversation" | "human_support" | "business_qa"
}

export const chatFlow: Record<string, ChatStep> = {
  MAIN: {
    assistantMessages: [
      (user: any) =>
        user?.nombre
          ? `¡Hola ${user.nombre}! 👋 Soy el Asistente Virtual de **Aloba**. ¿En qué puedo ayudarte hoy?`
          : "¡Hola! 👋 Soy el Asistente Virtual de **Aloba**, tu marketplace inmobiliario en Guatemala. ¿En qué puedo ayudarte?",
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar propiedades",
        description: "Encuentra tu inmueble ideal",
        icon: Search,
        nextStep: "BUSCAR_INMUEBLES",
      },
      {
        key: "zonas",
        label: "Explorar zonas",
        description: "Conoce las mejores ubicaciones",
        icon: MapPin,
        nextStep: "ZONAS",
      },
      {
        key: "como_funciona",
        label: "¿Cómo funciona?",
        description: "Conoce la plataforma",
        icon: HelpCircle,
        nextStep: "COMO_FUNCIONA",
      },
      {
        key: "contacto",
        label: "Contactar",
        description: "Habla con nosotros",
        icon: MessageCircle,
        nextStep: "CONTACTO",
      },
    ],
    viewMode: "business_qa",
  },

  BUSCAR_INMUEBLES: {
    assistantMessages: [
      `**Encuentra tu Propiedad Ideal** 🏠

En Aloba puedes buscar inmuebles por:

• **Tipo:** Apartamentos, casas, terrenos, oficinas, locales, bodegas
• **Zona:** Las 18 zonas de Guatemala
• **Precio:** Desde $150K hasta $400K+
• **Características:** Habitaciones, baños, parqueos

**¿Cómo buscar?**
1. Usa el buscador en la página principal
2. Aplica los filtros según tus necesidades
3. Explora las propiedades disponibles
4. Contáctanos para agendar una visita

¡Cuéntame qué estás buscando y te ayudo a encontrarlo!`,
    ],
    options: [
      {
        key: "zonas",
        label: "Ver zonas disponibles",
        icon: MapPin,
        nextStep: "ZONAS",
      },
      {
        key: "tipos",
        label: "Tipos de inmuebles",
        icon: Building2,
        nextStep: "TIPOS",
      },
      {
        key: "precios",
        label: "Rangos de precios",
        icon: DollarSign,
        nextStep: "PRECIOS",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  ZONAS: {
    assistantMessages: [
      `**Zonas de Guatemala** 📍

Las zonas más buscadas en nuestra plataforma:

**Zona 10 - Zona Viva / Oakland**
• Área premium, centros comerciales, vida nocturna
• Ideal para apartamentos de lujo

**Zona 14 - Las Américas / La Villa**
• Residencial de alta gama
• Colegios y hospitales cercanos

**Zona 15 - Vista Hermosa**
• Ambiente familiar y tranquilo
• Áreas verdes y parques

**Zona 16 - Acatán**
• Desarrollo en crecimiento
• Excelente inversión

También tenemos propiedades en zonas 1, 4, 5, 6, 7, 8, 9, 11, 12, 13, 17 y 18.

¿Te interesa alguna zona en particular?`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar por zona",
        icon: Search,
        nextStep: "BUSCAR_INMUEBLES",
      },
      {
        key: "tipos",
        label: "Ver tipos de inmuebles",
        icon: Building2,
        nextStep: "TIPOS",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  TIPOS: {
    assistantMessages: [
      `**Tipos de Inmuebles** 🏢

En Aloba encontrarás:

**Apartamentos**
• Studios, 1, 2, 3+ habitaciones
• En edificios con amenidades

**Casas**
• Unifamiliares y en condominio
• Con jardín y parqueo

**Terrenos**
• Para construcción residencial o comercial

**Oficinas**
• Espacios corporativos
• Coworking y privados

**Locales Comerciales**
• Para negocios y retail

**Bodegas**
• Almacenamiento industrial

¿Qué tipo de propiedad te interesa?`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar inmuebles",
        icon: Search,
        nextStep: "BUSCAR_INMUEBLES",
      },
      {
        key: "precios",
        label: "Ver precios",
        icon: DollarSign,
        nextStep: "PRECIOS",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  PRECIOS: {
    assistantMessages: [
      `**Rangos de Precios** 💰

**En Venta:**
• **Hasta $150,000** - Apartamentos pequeños, terrenos
• **$150,000 - $200,000** - Apartamentos 2 habitaciones
• **$200,000 - $300,000** - Casas y apartamentos amplios
• **$300,000 - $400,000** - Propiedades premium
• **$400,000+** - Inmuebles de lujo

**En Alquiler (mensual):**
• **Hasta $500** - Habitaciones, estudios
• **$500 - $1,000** - Apartamentos 1-2 hab
• **$1,000 - $2,000** - Apartamentos amplios
• **$2,000 - $5,000** - Casas premium
• **$5,000+** - Propiedades de lujo

¿Cuál es tu presupuesto?`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar por precio",
        icon: Search,
        nextStep: "BUSCAR_INMUEBLES",
      },
      {
        key: "zonas",
        label: "Ver zonas",
        icon: MapPin,
        nextStep: "ZONAS",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  COMO_FUNCIONA: {
    assistantMessages: [
      `**¿Cómo funciona Aloba?** 🏠

**Para Compradores/Inquilinos:**
1. **Busca** propiedades con filtros avanzados
2. **Explora** fotos, detalles y ubicación
3. **Contacta** directamente por WhatsApp
4. **Agenda** una visita al inmueble

**Beneficios:**
• Propiedades **verificadas**
• Información **completa** de cada inmueble
• Contacto **directo** sin intermediarios
• Búsqueda **rápida** con filtros inteligentes
• **Gratis** para usuarios

**¿Listo para encontrar tu inmueble?** Usa el buscador en la página principal.`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar inmuebles",
        icon: Search,
        nextStep: "BUSCAR_INMUEBLES",
      },
      {
        key: "contacto",
        label: "Contactar",
        icon: MessageCircle,
        nextStep: "CONTACTO",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  OPERACIONES: {
    assistantMessages: [
      `**Venta o Alquiler** 🔑

En Aloba puedes encontrar propiedades para:

**Venta**
• Compra tu inmueble propio
• Inversión a largo plazo
• Construcción en terrenos

**Alquiler**
• Renta mensual flexible
• Apartamentos amueblados
• Oficinas y locales

Puedes filtrar tu búsqueda por tipo de operación en nuestra plataforma.

¿Qué operación te interesa?`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar inmuebles",
        icon: Search,
        nextStep: "BUSCAR_INMUEBLES",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  CONTACTO: {
    assistantMessages: [
      `**Contacta con Aloba** 📬

Estamos aquí para ayudarte:

**WhatsApp:** [+502 3000 0000](https://wa.me/50230000000)
**Email:** contacto@marketplaceinmobiliario.com

**Horario de atención:**
Lunes a Viernes: 9:00 - 18:00 hrs
Sábados: 10:00 - 14:00 hrs

**Ubicación:**
📍 Guatemala, Ciudad de Guatemala

¿En qué más puedo ayudarte?`,
    ],
    options: [
      {
        key: "whatsapp",
        label: "Abrir WhatsApp",
        icon: MessageCircle,
        nextStep: "WHATSAPP",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  WHATSAPP: {
    assistantMessages: [
      `**Contactar por WhatsApp** 💬

Haz clic aquí para abrir WhatsApp:

**[Abrir WhatsApp](https://wa.me/50230000000)**

Te responderemos lo antes posible.

¿Hay algo más en lo que pueda ayudarte?`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar inmuebles",
        icon: Search,
        nextStep: "BUSCAR_INMUEBLES",
      },
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },

  DEFAULT: {
    assistantMessages: ["Disculpa, no entendí tu consulta. ¿Podrías reformularla o elegir una opción del menú?"],
    options: [
      {
        key: "volver",
        label: "Volver al menú",
        icon: MessageCircle,
        nextStep: "MAIN",
      },
    ],
    viewMode: "business_qa",
  },
}
