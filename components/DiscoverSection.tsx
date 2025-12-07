"use client"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')

const IconArrowUpRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
)

const IconHandCursor = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 12.0001V7.00005C8 5.34319 9.34315 4.00005 11 4.00005C11.3934 4.00005 11.7674 4.07897 12.1098 4.22303C12.3392 2.92381 13.4688 1.93755 14.8284 1.93755C16.3753 1.93755 17.6487 3.10931 17.8021 4.6139C17.8676 4.60927 17.9335 4.60693 18 4.60693C19.6569 4.60693 21 5.95008 21 7.60693V13.886C21 17.6599 18.0673 20.7679 14.3496 20.9926L14.0732 21.0001H10.638C7.54011 21.0001 4.88762 18.8953 4.14856 15.9392L3.10189 11.7525C2.86877 10.8201 3.42907 9.86847 4.36153 9.63536C5.29399 9.40224 6.24564 9.96254 6.47876 10.895L7.33333 14.3133V12.0001C7.33333 11.6319 7.63181 11.3334 8 11.3334C8.36819 11.3334 8.66667 11.6319 8.66667 12.0001V12.0001" stroke="white" strokeWidth="1.5" fill="#374151"/>
  </svg>
)

const BentoCard = ({ children, className, colSpan = "col-span-1" }: { children: React.ReactNode, className?: string, colSpan?: string }) => (
  <div className={cn(
    "relative rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl group h-[340px]",
    colSpan,
    className
  )}>
    {children}
  </div>
)

const ArrowButton = ({ dark = false }: { dark?: boolean }) => (
  <div className={cn(
    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1",
    dark ? "bg-white border-white text-[#0B1B32]" : "bg-transparent border-[#0B1B32] text-[#0B1B32]"
  )}>
    <IconArrowUpRight className="w-6 h-6" />
  </div>
)

export default function DiscoverSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-12 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="flex flex-col items-start relative">
            <div className="border border-[#0B1B32] rounded-full px-5 py-2 text-sm font-bold mb-4">
              Porque registrarte...
            </div>

            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#0B1B32]">
                Descubre más con aloba
              </h2>
              <div className="absolute -bottom-2 right-0 translate-x-1/2 translate-y-1/2">
                <IconHandCursor className="w-8 h-8 drop-shadow-md" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-6 max-w-md">
            <p className="text-lg font-medium opacity-90 lg:text-right text-[#0B1B32]">
              Regístrate gratis en 1 solo paso y desbloquea beneficios exclusivos.
            </p>
            <button className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm">
              Quiero registrarme!
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Acceso exclusivo */}
          <BentoCard className="bg-[#0B1B32] p-8 flex flex-col justify-between text-white">
            <div className="flex flex-col gap-4 relative z-10">
              <h3 className="text-2xl font-bold">Acceso exclusivo</h3>
              <p className="font-medium opacity-80 leading-snug">
                Descubre lanzamientos y preventas antes que nadie.
              </p>
            </div>
            <div className="self-end mt-4">
              <ArrowButton dark={true} />
            </div>
          </BentoCard>

          {/* Card 2: Imagen Wide */}
          <BentoCard className="lg:col-span-2 relative" colSpan="col-span-1 lg:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200"
              alt="Reunión de negocios"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </BentoCard>

          {/* Card 3: Comunidad */}
          <BentoCard className="bg-[#0B1B32] p-8 flex flex-col justify-between text-white">
            <div className="flex flex-col gap-4 relative z-10">
              <h3 className="text-2xl font-bold">Comunidad</h3>
              <p className="font-medium opacity-80 leading-snug">
                Únete a una red confiable y accede a información exclusiva del mercado.
              </p>
            </div>
            <div className="self-end mt-4">
              <ArrowButton dark={true} />
            </div>
          </BentoCard>

          {/* Card 4: No somos un clasificado */}
          <BentoCard className="bg-[#D1FAE5] p-8 flex flex-col justify-center gap-4">
            <h3 className="text-2xl font-bold text-[#0B1B32]">No somos un clasificado.</h3>
            <p className="font-medium text-[#0B1B32] opacity-90 leading-snug">
              Tampoco somos una agencia. Somos una plataforma de conexión, educación y decisión.
            </p>
          </BentoCard>

          {/* Card 5: Personalización */}
          <BentoCard className="bg-[#0B1B32] relative">
            <div className="p-8 pb-20 h-full flex flex-col justify-between relative z-10">
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-white">Personalización</h3>
                <p className="font-medium text-white opacity-80 leading-snug">
                  Guarda, compara y recibe alertas personalizadas en un solo lugar.
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white z-20 rounded-tl-[2rem] flex items-center justify-center pointer-events-none">
            </div>

            <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#0B1B32] text-[#0B1B32] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 cursor-pointer">
                <IconArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </BentoCard>

          {/* Card 6: Para quién es aloba */}
          <BentoCard className="bg-[#F3F4F6] flex items-center relative overflow-hidden" colSpan="col-span-1 lg:col-span-2">
            <div className="p-8 md:p-12 w-full lg:w-2/3 flex flex-col justify-center items-start gap-6 relative z-10">
              <div className="border border-[#0B1B32] rounded-full px-5 py-2 text-sm font-bold bg-transparent">
                Para quién es aloba...
              </div>
              <p className="text-lg font-bold text-[#0B1B32] leading-snug max-w-sm">
                Diseñado para compradores, inversionistas y profesionales.
                <br/>Información real y verificada.
                <br/>Transparencia en todo momento.
                <br/>Herramientas que simplifican decisiones.
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
          </BentoCard>

        </div>
      </div>
    </section>
  )
}
