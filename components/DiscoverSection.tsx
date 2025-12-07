"use client"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')

const IconArrowUpRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
)

const ArrowButton = ({ dark = false, small = false }: { dark?: boolean, small?: boolean }) => (
  <div className={cn(
    "rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1",
    small ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12",
    dark ? "bg-white border-white text-[#0B1B32]" : "bg-transparent border-[#0B1B32] text-[#0B1B32]"
  )}>
    <IconArrowUpRight className={small ? "w-4 h-4" : "w-5 h-5 md:w-6 md:h-6"} />
  </div>
)

export default function DiscoverSection() {
  return (
    <section className="w-full py-10 md:py-24 bg-white">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">

        {/* Header - Compacto en mobile */}
        <div className="mb-6 md:mb-12 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 md:gap-8">
          <div className="flex flex-col items-start relative">
            <div className="border border-[#0B1B32] rounded-full px-3 py-1 md:px-5 md:py-2 text-xs md:text-sm font-bold mb-2 md:mb-4">
              Porque registrarte...
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#0B1B32]">
              Descubre más con aloba
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6 w-full lg:w-auto lg:max-w-md">
            <p className="text-sm md:text-lg font-medium opacity-90 lg:text-right text-[#0B1B32] flex-1">
              Regístrate gratis y desbloquea beneficios exclusivos.
            </p>
            <button className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-sm md:text-lg py-2 px-5 md:py-3 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm whitespace-nowrap">
              Registrarme
            </button>
          </div>
        </div>

        {/* Bento Grid - 2 columnas en mobile */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">

          {/* Card 1: Acceso exclusivo */}
          <div className="relative rounded-xl md:rounded-[2rem] overflow-hidden bg-[#0B1B32] p-4 md:p-8 flex flex-col justify-between text-white h-[160px] md:h-[340px] group">
            <div className="flex flex-col gap-2 md:gap-4 relative z-10">
              <h3 className="text-sm md:text-2xl font-bold">Acceso exclusivo</h3>
              <p className="font-medium opacity-80 leading-snug text-xs md:text-base hidden sm:block">
                Descubre lanzamientos y preventas antes que nadie.
              </p>
            </div>
            <div className="self-end mt-2 md:mt-4">
              <ArrowButton dark={true} small />
            </div>
          </div>

          {/* Card 2: Imagen Wide - Full width en mobile */}
          <div className="relative rounded-xl md:rounded-[2rem] overflow-hidden h-[160px] md:h-[340px] col-span-1 lg:col-span-2 group">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200"
              alt="Reunión de negocios"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </div>

          {/* Card 3: Comunidad */}
          <div className="relative rounded-xl md:rounded-[2rem] overflow-hidden bg-[#0B1B32] p-4 md:p-8 flex flex-col justify-between text-white h-[160px] md:h-[340px] group">
            <div className="flex flex-col gap-2 md:gap-4 relative z-10">
              <h3 className="text-sm md:text-2xl font-bold">Comunidad</h3>
              <p className="font-medium opacity-80 leading-snug text-xs md:text-base hidden sm:block">
                Únete a una red confiable del mercado.
              </p>
            </div>
            <div className="self-end mt-2 md:mt-4">
              <ArrowButton dark={true} small />
            </div>
          </div>

          {/* Card 4: No somos un clasificado */}
          <div className="relative rounded-xl md:rounded-[2rem] overflow-hidden bg-[#D1FAE5] p-4 md:p-8 flex flex-col justify-center gap-2 md:gap-4 h-[160px] md:h-[340px]">
            <h3 className="text-sm md:text-2xl font-bold text-[#0B1B32]">No somos un clasificado.</h3>
            <p className="font-medium text-[#0B1B32] opacity-90 leading-snug text-xs md:text-base">
              <span className="hidden md:inline">Tampoco somos una agencia. </span>Somos una plataforma de conexión y decisión.
            </p>
          </div>

          {/* Card 5: Personalización */}
          <div className="relative rounded-xl md:rounded-[2rem] overflow-hidden bg-[#0B1B32] h-[160px] md:h-[340px] group">
            <div className="p-4 md:p-8 md:pb-20 h-full flex flex-col justify-between relative z-10">
              <div className="flex flex-col gap-2 md:gap-4">
                <h3 className="text-sm md:text-2xl font-bold text-white">Personalización</h3>
                <p className="font-medium text-white opacity-80 leading-snug text-xs md:text-base hidden sm:block">
                  Guarda, compara y recibe alertas.
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-white z-20 rounded-tl-xl md:rounded-tl-[2rem] flex items-center justify-center pointer-events-none">
            </div>

            <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6 z-30 pointer-events-auto">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-[#0B1B32] text-[#0B1B32] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 cursor-pointer">
                <IconArrowUpRight className="w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          {/* Card 6: Para quién es aloba */}
          <div className="relative rounded-xl md:rounded-[2rem] overflow-hidden bg-[#F3F4F6] flex items-center h-[160px] md:h-[340px] col-span-2 lg:col-span-2">
            <div className="p-4 md:p-12 w-full lg:w-2/3 flex flex-col justify-center items-start gap-2 md:gap-6 relative z-10">
              <div className="border border-[#0B1B32] rounded-full px-3 py-1 md:px-5 md:py-2 text-xs md:text-sm font-bold bg-transparent">
                Para quién es aloba...
              </div>
              <p className="text-xs sm:text-sm md:text-lg font-bold text-[#0B1B32] leading-snug max-w-sm">
                <span className="hidden md:inline">Diseñado para compradores, inversionistas y profesionales.<br/>Información real y verificada.<br/>Transparencia en todo momento.<br/>Herramientas que simplifican decisiones.</span>
                <span className="md:hidden">Para compradores, inversionistas y profesionales. Información verificada.</span>
              </p>
            </div>

            <div className="absolute right-0 bottom-[-20px] w-1/2 h-[120%] hidden md:block">
              <div className="absolute top-10 right-10 w-[200px] h-[400px] bg-black rounded-[2.5rem] border-8 border-gray-800 shadow-2xl rotate-[-15deg] overflow-hidden translate-y-10 translate-x-10 ring-1 ring-white/20">
                <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400" alt="App preview" className="w-full h-full object-cover opacity-80"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <div className="text-white text-xs font-bold mb-2">Proyecto Destacado</div>
                  <div className="h-2 w-16 bg-white/50 rounded mb-2"></div>
                  <div className="h-2 w-10 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
