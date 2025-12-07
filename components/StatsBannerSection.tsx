"use client"

export default function StatsBannerSection() {
  return (
    <section className="w-full pt-4 pb-14 md:pt-6 md:pb-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 space-y-12 md:space-y-14">

        {/* Banner de estadísticas */}
        <div
          className="bg-[#0B1B32] rounded-[1.5rem] md:rounded-[3rem] px-4 py-5 md:px-14 md:py-10 text-white shadow-2xl relative overflow-hidden"
          role="region"
          aria-label="Estadísticas de Aloba"
        >
          <dl className="grid grid-cols-3 gap-2 md:gap-4 text-center items-start">

            {/* Columna 1 */}
            <div className="flex flex-col items-center justify-center w-full">
              <dt className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-0.5 md:mb-2 tracking-tight">+100</dt>
              <dd className="text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight md:leading-relaxed font-medium text-gray-300">
                <span className="hidden sm:inline">Proyectos activos en<br />un solo lugar</span>
                <span className="sm:hidden">Proyectos<br />activos</span>
              </dd>
            </div>

            {/* Columna 2 */}
            <div className="flex flex-col items-center justify-center w-full border-x border-gray-700/50 px-1 md:px-4">
              <dt className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-0.5 md:mb-2 tracking-tight">3 min</dt>
              <dd className="text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight md:leading-relaxed font-medium text-gray-300">
                <span className="hidden sm:inline">Necesitas para encontrar<br />tu mejor opción</span>
                <span className="sm:hidden">Para encontrar<br />tu opción</span>
              </dd>
            </div>

            {/* Columna 3 */}
            <div className="flex flex-col items-center justify-center w-full">
              <dt className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-0.5 md:mb-2 tracking-tight">+tools</dt>
              <dd className="text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight md:leading-relaxed font-medium text-gray-300">
                <span className="hidden sm:inline">Calculadoras para planear<br />tu <span className="font-bold text-white">inversión con confianza</span></span>
                <span className="sm:hidden">Calculadoras<br />disponibles</span>
              </dd>
            </div>

          </dl>
        </div>

        {/* Logos de desarrolladoras */}
        <ul
          className="flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center gap-10 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 hover:opacity-100 px-4"
          aria-label="Desarrolladoras asociadas"
        >

          {/* Logo 1: Spectrum */}
          <li className="h-8 md:h-10 flex items-center justify-center list-none">
            <svg viewBox="0 0 140 40" fill="#0B1B32" className="h-full w-auto" role="img" aria-label="Spectrum">
              <path d="M20,5 C10,5 5,12 5,20 C5,28 10,35 20,35 C28,35 32,28 32,20 L25,20 C25,25 23,29 20,29 C15,29 12,25 12,20 C12,15 15,11 20,11 C23,11 25,14 25,18 L32,18 C30,10 26,5 20,5 Z" />
              <text x="40" y="28" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24">spectrum</text>
            </svg>
          </li>

          {/* Logo 2: ASTY */}
          <li className="h-8 md:h-10 flex items-center justify-center list-none">
            <div className="border-[2px] border-[#0B1B32] p-1 font-bold text-[#0B1B32] text-base leading-none grid grid-cols-2 gap-0.5" role="img" aria-label="ASTY">
              <div>A</div><div>S</div><div>T</div><div>Y</div>
            </div>
          </li>

          {/* Logo 3: Íntegro */}
          <li className="h-8 md:h-10 flex items-center justify-center gap-1.5 text-[#0B1B32] list-none">
            <div role="img" aria-label="Íntegro" className="flex items-center gap-1.5">
              <span className="text-2xl" aria-hidden="true">✧</span>
              <span className="font-bold text-2xl tracking-tight">íntegro</span>
            </div>
          </li>

          {/* Logo 4: SUR */}
          <li className="h-10 md:h-12 flex flex-col items-center justify-center text-[#0B1B32] list-none">
            <div role="img" aria-label="SUR Desarrollos" className="flex flex-col items-center justify-center">
              <span className="font-black text-3xl tracking-tighter leading-none">SUR</span>
              <span className="text-[9px] tracking-[0.15em] font-bold uppercase">Desarrollos</span>
            </div>
          </li>

          {/* Logo 5: Square */}
          <li className="h-8 md:h-10 flex items-center justify-center text-[#0B1B32] list-none">
            <svg viewBox="0 0 40 40" fill="currentColor" className="h-full w-auto" role="img" aria-label="Square">
              <rect width="40" height="40" rx="8" />
              <rect x="12" y="12" width="16" height="16" fill="white" />
            </svg>
          </li>

        </ul>

      </div>
    </section>
  )
}
