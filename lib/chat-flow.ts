// lib/chat-flow.ts - Flujo de conversación para DocTop
import type { LucideIcon } from "lucide-react"
import { Stethoscope, Search, Calendar, Users, MessageCircle, Shield, Star, MapPin } from "lucide-react"

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
          ? `¡Hola ${user.nombre}! 👋 Soy el Asistente Virtual de **DocTop**. ¿En qué puedo ayudarte hoy?`
          : "¡Hola! 👋 Soy el Asistente Virtual de **DocTop**, la plataforma médica de México. ¿En qué puedo ayudarte?",
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar médicos",
        description: "Encuentra especialistas verificados",
        icon: Search,
        nextStep: "BUSCAR_MEDICOS",
      },
      {
        key: "como_funciona",
        label: "¿Cómo funciona?",
        description: "Conoce la plataforma",
        icon: Stethoscope,
        nextStep: "COMO_FUNCIONA",
      },
      {
        key: "para_medicos",
        label: "Soy médico",
        description: "Beneficios para profesionales",
        icon: Users,
        nextStep: "PARA_MEDICOS",
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

  BUSCAR_MEDICOS: {
    assistantMessages: [
      `**Encuentra tu Especialista Ideal** 🔍

En DocTop puedes buscar médicos por:

• **Especialidad:** Cardiología, Dermatología, Pediatría, Ortopedia, y más
• **Ubicación:** Filtra por ciudad o colonia
• **Disponibilidad:** Ve horarios de consulta
• **Valoraciones:** Médicos con las mejores calificaciones

**¿Cómo buscar?**
1. Ve a la página principal
2. Usa el buscador por nombre o especialidad
3. Revisa los perfiles de los médicos
4. Contacta directamente por WhatsApp

Todos nuestros médicos están **verificados profesionalmente** ✅`,
    ],
    options: [
      {
        key: "como_funciona",
        label: "¿Cómo agendar cita?",
        icon: Calendar,
        nextStep: "COMO_FUNCIONA",
      },
      {
        key: "especialidades",
        label: "Ver especialidades",
        icon: Stethoscope,
        nextStep: "ESPECIALIDADES",
      },
      {
        key: "contacto",
        label: "Necesito ayuda",
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

  COMO_FUNCIONA: {
    assistantMessages: [
      `**¿Cómo funciona DocTop?** 🏥

**Para Pacientes:**
1. **Busca** médicos por especialidad o nombre
2. **Revisa** perfiles con foto, experiencia y ubicación
3. **Contacta** directamente por WhatsApp
4. **Agenda** tu cita con el médico

**Beneficios:**
• Médicos **verificados** profesionalmente
• Información completa de cada especialista
• Contacto **directo** sin intermediarios
• Valoraciones de otros pacientes
• **Gratis** para pacientes

**¿Listo para encontrar tu médico?** Usa el buscador en la página principal.`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar médicos",
        icon: Search,
        nextStep: "BUSCAR_MEDICOS",
      },
      {
        key: "para_medicos",
        label: "Soy médico",
        icon: Users,
        nextStep: "PARA_MEDICOS",
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

  ESPECIALIDADES: {
    assistantMessages: [
      `**Especialidades Médicas en DocTop** 👨‍⚕️

Contamos con profesionales en diversas áreas:

**Medicina General**
• Consultas de rutina y prevención

**Especialidades más buscadas:**
• **Cardiología** - Corazón y sistema cardiovascular
• **Dermatología** - Piel, cabello y uñas
• **Ortopedia** - Huesos, músculos y articulaciones
• **Pediatría** - Salud infantil
• **Ginecología** - Salud de la mujer
• **Neurología** - Sistema nervioso
• **Oftalmología** - Salud visual

Y muchas más especialidades con médicos verificados listos para atenderte.`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar médicos",
        icon: Search,
        nextStep: "BUSCAR_MEDICOS",
      },
      {
        key: "como_funciona",
        label: "¿Cómo agendar?",
        icon: Calendar,
        nextStep: "COMO_FUNCIONA",
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

  PARA_MEDICOS: {
    assistantMessages: [
      `**Beneficios para Médicos** 🩺

**¿Por qué unirte a DocTop?**

• **Perfil profesional** - Muestra tu experiencia, especialidad y ubicación
• **Visibilidad** - Aparece en búsquedas de pacientes en México
• **Contacto directo** - Los pacientes te contactan por WhatsApp
• **Gratis para empezar** - Crea tu perfil sin costo
• **Verificación** - Badge de médico verificado
• **Sin comisiones** - Tú manejas tus consultas

**¿Cómo empezar?**
1. Regístrate con Google
2. Completa tu perfil médico
3. Sube tu foto profesional
4. ¡Listo! Pacientes te encontrarán

**[Crear mi perfil gratis](/login)**`,
    ],
    options: [
      {
        key: "planes",
        label: "Ver planes",
        icon: Star,
        nextStep: "PLANES",
      },
      {
        key: "contacto",
        label: "Contactar ventas",
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

  PLANES: {
    assistantMessages: [
      `**Planes para Médicos** ⭐

**Plan Básico (Gratis)**
• Perfil profesional básico
• Contacto por WhatsApp
• Aparecer en búsquedas

**Plan Premium**
• Todo lo del plan básico
• Perfil destacado en búsquedas
• Badge verificado premium
• Estadísticas de visitas
• Soporte prioritario

Para más información sobre precios y beneficios, contáctanos directamente.

**¿Te interesa el plan premium?** Escríbenos por WhatsApp.`,
    ],
    options: [
      {
        key: "contacto",
        label: "Contactar ventas",
        icon: MessageCircle,
        nextStep: "CONTACTO",
      },
      {
        key: "para_medicos",
        label: "Más beneficios",
        icon: Users,
        nextStep: "PARA_MEDICOS",
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
      `**Contacta con DocTop** 📬

Estamos aquí para ayudarte:

**WhatsApp:** [+54 9 236 465 5702](https://wa.me/5492364655702)
**Email:** contacto@doctop.space

**Horario de atención:**
Lunes a Viernes: 9:00 - 18:00 hrs
Sábados: 10:00 - 14:00 hrs

**Ubicación:**
📍 Argentina

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

**[Abrir WhatsApp](https://wa.me/5492364655702)**

Te responderemos lo antes posible.

¿Hay algo más en lo que pueda ayudarte?`,
    ],
    options: [
      {
        key: "buscar",
        label: "Buscar médicos",
        icon: Search,
        nextStep: "BUSCAR_MEDICOS",
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

  QA_FOLLOW_UP: {
    assistantMessages: [],
    options: [
      {
        key: "buscar",
        label: "Buscar médicos",
        icon: Search,
        nextStep: "BUSCAR_MEDICOS",
      },
      {
        key: "como_funciona",
        label: "¿Cómo funciona?",
        icon: Stethoscope,
        nextStep: "COMO_FUNCIONA",
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
