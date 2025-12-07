"use client"

import Header from "@/components/Header"
import HeroSearchBanner from "@/components/HeroSearchBanner"
import ProjectsCarouselSection from "@/components/ProjectsCarouselSection"
import StatsBannerSection from "@/components/StatsBannerSection"
import WhyAlobaSection from "@/components/WhyAlobaSection"
import DiscoverSection from "@/components/DiscoverSection"
import TestimonialsSection from "@/components/TestimonialsSection"
import Footer from "@/components/Footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { SupportChatWidget } from "@/components/chat/SupportChatWidget"

export default function ConocenosPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0B1B32] flex flex-col relative selection:bg-[#00F0D0] selection:text-[#0B1B32]">
      <Header activePage="conocenos" />

      <section
        className="flex-grow mx-3 mb-3 md:mx-6 md:mb-6 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden flex flex-col items-center justify-center min-h-[85vh] shadow-2xl z-0"
        aria-label="Búsqueda de propiedades en Guatemala"
      >
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"
            alt="Vista panorámica de Ciudad de Guatemala con desarrollos inmobiliarios modernos"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
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

          <HeroSearchBanner />
        </div>
      </section>

      <ProjectsCarouselSection />

      <StatsBannerSection />

      <WhyAlobaSection />

      <DiscoverSection />

      <TestimonialsSection />

      <Footer />

      <WhatsAppButton />
      <SupportChatWidget />
    </div>
  )
}
