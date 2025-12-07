"use client"

type FlowType = "none" | "zone" | "prequal"

interface HeroSectionProps {
  onSelectFlow: (flow: FlowType) => void
}

export default function HeroSection({ onSelectFlow }: HeroSectionProps) {
  return (
    <main
      role="banner"
      className="flex-grow flex flex-col items-center justify-center text-center px-4 md:px-6 py-8 min-h-[80vh] relative bg-white"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-10">
        <h1 className="text-4xl md:text-[56px] leading-[1.1] font-bold text-[#0B1B32] tracking-tight">
          Todo lo que necesitas para
          <br className="hidden md:block" />
          tu próxima inversión inmobiliaria.
        </h1>
        <p className="text-lg md:text-xl font-medium text-[#0B1B32] mt-4 opacity-80">
          Elige una herramienta para comenzar.
        </p>

        <nav aria-label="Herramientas de inversión inmobiliaria">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <button
              type="button"
              onClick={() => onSelectFlow("zone")}
              aria-label="Iniciar herramienta para encontrar la zona ideal para tu inversión"
              className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md w-full md:w-auto min-w-[250px] focus:outline-none focus:ring-4 focus:ring-[#00F0D0]/50 focus:ring-offset-2"
            >
              Encontrar la Zona
            </button>

            <button
              type="button"
              onClick={() => onSelectFlow("prequal")}
              aria-label="Iniciar herramienta de pre-calificación para crédito inmobiliario"
              className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md w-full md:w-auto min-w-[250px] focus:outline-none focus:ring-4 focus:ring-[#00F0D0]/50 focus:ring-offset-2"
            >
              Pre-Calificación
            </button>
          </div>
        </nav>
      </div>
    </main>
  )
}
