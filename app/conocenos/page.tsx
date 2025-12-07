"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check } from "lucide-react"
import Header from "@/components/Header"
import ProjectsCarouselSection from "@/components/ProjectsCarouselSection"
import StatsBannerSection from "@/components/StatsBannerSection"
import WhyAlobaSection from "@/components/WhyAlobaSection"
import DiscoverSection from "@/components/DiscoverSection"
import TestimonialsSection from "@/components/TestimonialsSection"
import Footer from "@/components/Footer"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

interface FilterOption {
  label: string
  subLabel?: string
}

interface SearchFilterItemProps {
  label: string
  value: string
  isOpen: boolean
  onToggle: () => void
  options: FilterOption[]
  hasSeparator?: boolean
}

function SearchFilterItem({ label, value, isOpen, onToggle, options, hasSeparator }: SearchFilterItemProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-center px-4 py-3 cursor-pointer w-full transition-all duration-300 group",
        "hover:bg-gray-50/80",
        hasSeparator && "lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:h-12 lg:after:w-[1px] lg:after:bg-gray-200",
        "border-b border-gray-100 lg:border-none"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 select-none flex items-center gap-1 transition-colors group-hover:text-[#00F0D0]">
        {label}
      </span>

      <div className="flex items-center justify-between text-[#0B1B32]">
        <span className="font-bold text-[14px] md:text-[15px] truncate select-none leading-tight">{value}</span>
        <div className={cn(
          "transition-transform duration-300 text-gray-400 group-hover:text-[#00F0D0]",
          isOpen && "rotate-180 text-[#00F0D0]"
        )}>
          <ChevronDown size={20} strokeWidth={2.5} />
        </div>
      </div>

      <div className={cn(
        "absolute bottom-full mb-2 left-0 w-full min-w-[240px] bg-white rounded-2xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15),0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-50",
        "transform transition-all duration-200 origin-bottom",
        isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 translate-y-2 invisible pointer-events-none"
      )}>
        <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-[#F0FDFA] rounded-xl transition-colors cursor-pointer group/item">
              <div>
                <div className="font-bold text-[#0B1B32] text-sm group-hover/item:text-[#00F0D0] transition-colors">{opt.label}</div>
                {opt.subLabel && <div className="text-xs text-gray-400 mt-0.5">{opt.subLabel}</div>}
              </div>
              {value.includes(opt.label) && <Check size={16} className="text-[#00F0D0]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ConocenosPage() {
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const filterContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-[#0B1B32] flex flex-col relative selection:bg-[#00F0D0] selection:text-[#0B1B32]">
      <Header activePage="conocenos" />

      <div className="flex-grow mx-3 mb-3 md:mx-6 md:mb-6 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden flex flex-col items-center justify-center min-h-[85vh] shadow-2xl z-0">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"
            alt="Guatemala City Real Estate"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04080F]/90 via-[#0B1B32]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 md:px-8 flex flex-col items-center text-center py-10 md:py-0">
          <h1 className="text-[28px] leading-[1.15] sm:text-[36px] md:text-[46px] lg:text-[54px] md:leading-[1.1] font-bold text-white mb-5 md:mb-6 drop-shadow-2xl tracking-tight max-w-4xl mx-auto">
            El marketplace inmobiliario de<br className="block" />
            Ciudad de Guatemala
          </h1>

          <p className="text-base md:text-[18px] text-white/90 font-medium mb-8 md:mb-10 drop-shadow-lg max-w-xl mx-auto leading-relaxed">
            Encuentra una propiedad <span className="text-[#00F0D0] font-bold">80% más rápido.</span>
          </p>

          <div
            ref={filterContainerRef}
            className="bg-white rounded-[2rem] p-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-[360px] lg:max-w-[900px] flex flex-col lg:flex-row items-stretch lg:items-center animate-in fade-in zoom-in-95 duration-700 backdrop-blur-sm border border-white/80"
          >
            <div className="flex-1 w-full">
              <SearchFilterItem
                label="Ubicación"
                value="Zona 14"
                isOpen={openFilter === "location"}
                onToggle={() => setOpenFilter(openFilter === "location" ? null : "location")}
                hasSeparator={true}
                options={[
                  { label: "Zona 14", subLabel: "La Villa, Las Américas" },
                  { label: "Zona 10", subLabel: "Zona Viva, Oakland" },
                  { label: "Cayalá", subLabel: "Paseo Cayalá, Lirios" },
                  { label: "Zona 15", subLabel: "Vista Hermosa" }
                ]}
              />
            </div>

            <div className="flex-1 w-full">
              <SearchFilterItem
                label="Número de habitaciones"
                value="2 y 3 hab"
                isOpen={openFilter === "rooms"}
                onToggle={() => setOpenFilter(openFilter === "rooms" ? null : "rooms")}
                hasSeparator={true}
                options={[
                  { label: "1 habitación", subLabel: "Loft / Studio" },
                  { label: "2 habitaciones", subLabel: "Parejas" },
                  { label: "2 y 3 hab", subLabel: "Familia pequeña" },
                  { label: "4+ habitaciones", subLabel: "Penthouse" }
                ]}
              />
            </div>

            <div className="flex-1 w-full">
              <SearchFilterItem
                label="Rango de precio"
                value="$250K - $295K"
                isOpen={openFilter === "price"}
                onToggle={() => setOpenFilter(openFilter === "price" ? null : "price")}
                hasSeparator={false}
                options={[
                  { label: "$150K - $200K" },
                  { label: "$200K - $250K" },
                  { label: "$250K - $295K" },
                  { label: "$300K+" }
                ]}
              />
            </div>

            <div className="mt-2 lg:mt-0 lg:pl-2 w-full lg:w-auto">
              <button className="w-full lg:w-auto bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-extrabold text-[14px] py-3 px-6 rounded-[1.5rem] transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(0,240,208,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(0,240,208,0.5)] hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProjectsCarouselSection />

      <StatsBannerSection />

      <WhyAlobaSection />

      <DiscoverSection />

      <TestimonialsSection />

      <Footer />
    </div>
  )
}
