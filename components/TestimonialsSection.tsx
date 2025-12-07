"use client"

const IconArrowLeft = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6"/>
  </svg>
)

const IconArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
)

const TESTIMONIALS = [
  {
    id: 1,
    quote: "Me da mucha seguridad contactar a los agentes a través del portal, el inventario está actualizado.",
    author: "María Hernández",
    role: "Usuario"
  },
  {
    id: 2,
    quote: "Excelente herramienta para los agentes. Nos ayuda a estar más ordenados fácilmente.",
    author: "Pablo Arenales",
    role: "Agente"
  },
  {
    id: 3,
    quote: "Única plataforma donde encuentro a los mejores agentes y proyectos en un mismo lugar.",
    author: "Íntegro",
    role: "Desarrolladora"
  },
  {
    id: 4,
    quote: "La comparación de precios por zona me ayudó a tomar la mejor decisión de inversión.",
    author: "Carlos Ruiz",
    role: "Inversionista"
  },
  {
    id: 5,
    quote: "La interfaz es increíblemente rápida y fácil de usar, encontré mi apartamento en días.",
    author: "Sofía M.",
    role: "Usuario"
  },
  {
    id: 6,
    quote: "Como desarrolladora, aloba nos conecta con clientes realmente calificados.",
    author: "Sur Desarrollos",
    role: "Desarrolladora"
  },
  {
    id: 7,
    quote: "Las calculadoras hipotecarias integradas son un gran plus para mis clientes.",
    author: "Ana G.",
    role: "Agente Independiente"
  },
  {
    id: 8,
    quote: "Poder filtrar por rentabilidad estimada cambió mi forma de buscar propiedades.",
    author: "Luis Torres",
    role: "Inversionista"
  },
  {
    id: 9,
    quote: "El soporte y la verificación de los listados me dan total tranquilidad.",
    author: "Gabriela P.",
    role: "Usuario"
  },
  {
    id: 10,
    quote: "Una plataforma que realmente entiende el mercado inmobiliario de Guatemala.",
    author: "Spectrum",
    role: "Desarrolladora"
  }
]

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
}

const TestimonialCard = ({ quote, author, role }: TestimonialCardProps) => (
  <div className="flex flex-col h-[300px] w-[320px] md:w-[360px] flex-shrink-0 mx-4 relative">
    <div className="absolute inset-0 bg-white rounded-[2rem]"></div>
    <div className="absolute bottom-0 left-0 w-[35%] h-[45px] bg-[#0B1B32] rounded-tr-[1.5rem] z-10"></div>
    <div className="relative z-20 h-full flex flex-col justify-between p-8">
      <div className="mb-4">
        <p className="text-[#0B1B32] font-bold text-lg md:text-[20px] leading-snug">
          &quot;{quote}&quot;
        </p>
      </div>
      <div className="flex flex-col items-end text-right mt-auto pb-1">
        <span className="text-[#0B1B32] font-bold text-lg">{author}</span>
        <span className="text-[#00F0D0] font-bold text-sm">{role}</span>
      </div>
    </div>
  </div>
)

export default function TestimonialsSection() {
  const infiniteTestimonials = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="bg-[#0B1B32] rounded-[3rem] py-20 md:py-24 relative overflow-hidden shadow-2xl flex flex-col items-center">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-20 px-4 relative z-10">
            <div className="border border-white/20 text-white rounded-full px-6 py-2 text-sm font-bold mb-6 tracking-wide bg-white/5 backdrop-blur-sm">
              Nuestra comunidad
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Lo que dicen de aloba
            </h2>
          </div>

          {/* Carrusel */}
          <div className="w-full relative overflow-hidden group/carousel">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0B1B32] to-transparent z-20 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0B1B32] to-transparent z-20 pointer-events-none"></div>

            <div className="flex animate-scroll w-max hover:cursor-grab active:cursor-grabbing pl-4">
              {infiniteTestimonials.map((item, index) => (
                <TestimonialCard
                  key={`${item.id}-${index}`}
                  quote={item.quote}
                  author={item.author}
                  role={item.role}
                />
              ))}
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-4 mt-14 z-20">
            <button className="w-14 h-14 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-[#0B1B32] transition-all duration-300 group">
              <IconArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button className="w-14 h-14 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-[#0B1B32] transition-all duration-300 group">
              <IconArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
