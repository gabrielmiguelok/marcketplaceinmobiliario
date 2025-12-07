"use client"

export default function WhyAlobaSection() {
  return (
    <section className="w-full py-12 md:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Bloque de Texto - Independiente */}
        <div className="max-w-[600px]">
          <div className="inline-block px-6 py-2.5 rounded-full border border-[#0B1B32] text-[#0B1B32] font-bold text-base mb-6 bg-white">
            La pregunta del millón...
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0B1B32] mb-5 leading-[1.1]">
            ¿Por qué explorar en aloba?
          </h2>

          <p className="text-lg md:text-xl lg:text-2xl text-[#0B1B32] font-medium leading-relaxed opacity-80">
            La forma más clara y confiable de explorar el mercado inmobiliario en Guatemala, con todo lo que necesitas para decidir mejor.
          </p>
        </div>

        {/* Bloque de Tarjetas - Independiente */}
        <div className="flex justify-end mt-6 md:-mt-12 lg:-mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-end" style={{ width: "min(100%, 984px)" }}>

            {/* Tarjeta 1: Gris (Baja) */}
            <div className="bg-[#F3F4F6] rounded-[2rem] p-7 md:p-8 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300" style={{ height: "312px" }}>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#0B1B32] mb-2">Mapa interactivo</h3>
                <p className="text-[#0B1B32]/70 leading-snug font-medium text-sm md:text-base">
                  Explora proyectos en la ciudad con nuestra búsqueda geográfica avanzada.
                </p>
              </div>
              <div className="absolute bottom-5 right-5 w-10 h-10 bg-[#00F0D0] rounded-full flex items-center justify-center text-[#0B1B32] font-bold text-lg shadow-sm">
                1
              </div>
            </div>

            {/* Tarjeta 2: Verde Claro (Media) */}
            <div className="bg-[#D1FAE5] rounded-[2rem] p-7 md:p-8 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300" style={{ height: "396px" }}>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#0B1B32] mb-2">Conexión directa</h3>
                <p className="text-[#0B1B32]/70 leading-snug font-medium text-sm md:text-base">
                  Habla directamente con los desarrolladores y resuelve tus dudas sin intermediarios.
                </p>
              </div>
              <div className="absolute bottom-5 right-5 w-10 h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#0B1B32] font-bold text-lg shadow-sm">
                2
              </div>
            </div>

            {/* Tarjeta 3: Turquesa (Alta) */}
            <div className="bg-[#00F0D0] rounded-[2rem] p-7 md:p-8 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300" style={{ height: "480px" }}>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#0B1B32] mb-2">Todo en un mismo lugar</h3>
                <p className="text-[#0B1B32]/70 leading-snug font-medium text-sm md:text-base">
                  Información clara, segura y ordenada para que tomes decisiones con confianza.
                </p>
              </div>
              <div className="absolute bottom-5 right-5 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0B1B32] font-bold text-lg shadow-sm">
                3
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
