"use client"

export default function WhyAlobaSection() {
  return (
    <section className="w-full py-8 md:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Bloque de Texto - Independiente */}
        <div className="max-w-[600px]">
          <div className="inline-block px-4 py-1.5 md:px-6 md:py-2.5 rounded-full border border-[#0B1B32] text-[#0B1B32] font-bold text-xs md:text-base mb-4 md:mb-6 bg-white">
            La pregunta del millón...
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0B1B32] mb-3 md:mb-5 leading-[1.1]">
            ¿Por qué explorar en aloba?
          </h2>

          <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-[#0B1B32] font-medium leading-relaxed opacity-80">
            <span className="hidden sm:inline">La forma más clara y confiable de explorar el mercado inmobiliario en Guatemala, con todo lo que necesitas para decidir mejor.</span>
            <span className="sm:hidden">La forma más clara de explorar el mercado inmobiliario en Guatemala.</span>
          </p>
        </div>

        {/* Bloque de Tarjetas - Horizontal en mobile, escalonado en desktop */}
        <div className="flex justify-center md:justify-end mt-6 md:-mt-12 lg:-mt-16">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 items-end w-full md:w-auto" style={{ maxWidth: "984px" }}>

            {/* Tarjeta 1: Gris (Baja) */}
            <div className="bg-[#F3F4F6] rounded-xl md:rounded-[2rem] p-3 md:p-8 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300 h-[140px] sm:h-[180px] md:h-[312px]">
              <div>
                <h3 className="text-xs sm:text-sm md:text-xl font-bold text-[#0B1B32] mb-1 md:mb-2 leading-tight">Mapa interactivo</h3>
                <p className="text-[#0B1B32]/70 leading-tight md:leading-snug font-medium text-[10px] sm:text-xs md:text-base hidden sm:block">
                  <span className="hidden md:inline">Explora proyectos en la ciudad con nuestra búsqueda geográfica avanzada.</span>
                  <span className="md:hidden">Búsqueda geográfica avanzada.</span>
                </p>
              </div>
              <div className="absolute bottom-2 right-2 md:bottom-5 md:right-5 w-6 h-6 md:w-10 md:h-10 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] font-bold text-xs md:text-lg shadow-sm">
                1
              </div>
            </div>

            {/* Tarjeta 2: Verde Claro (Media) */}
            <div className="bg-[#D1FAE5] rounded-xl md:rounded-[2rem] p-3 md:p-8 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300 h-[160px] sm:h-[200px] md:h-[396px]">
              <div>
                <h3 className="text-xs sm:text-sm md:text-xl font-bold text-[#0B1B32] mb-1 md:mb-2 leading-tight">Conexión directa</h3>
                <p className="text-[#0B1B32]/70 leading-tight md:leading-snug font-medium text-[10px] sm:text-xs md:text-base hidden sm:block">
                  <span className="hidden md:inline">Habla directamente con los desarrolladores y resuelve tus dudas sin intermediarios.</span>
                  <span className="md:hidden">Habla con desarrolladores.</span>
                </p>
              </div>
              <div className="absolute bottom-2 right-2 md:bottom-5 md:right-5 w-6 h-6 md:w-10 md:h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#0B1B32] font-bold text-xs md:text-lg shadow-sm">
                2
              </div>
            </div>

            {/* Tarjeta 3: Turquesa (Alta) */}
            <div className="bg-[#00F0D0] rounded-xl md:rounded-[2rem] p-3 md:p-8 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300 h-[180px] sm:h-[220px] md:h-[480px]">
              <div>
                <h3 className="text-xs sm:text-sm md:text-xl font-bold text-[#0B1B32] mb-1 md:mb-2 leading-tight">Todo en un lugar</h3>
                <p className="text-[#0B1B32]/70 leading-tight md:leading-snug font-medium text-[10px] sm:text-xs md:text-base hidden sm:block">
                  <span className="hidden md:inline">Información clara, segura y ordenada para que tomes decisiones con confianza.</span>
                  <span className="md:hidden">Información clara y segura.</span>
                </p>
              </div>
              <div className="absolute bottom-2 right-2 md:bottom-5 md:right-5 w-6 h-6 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-[#0B1B32] font-bold text-xs md:text-lg shadow-sm">
                3
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
