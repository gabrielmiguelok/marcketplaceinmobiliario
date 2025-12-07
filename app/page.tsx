"use client"

import { useState } from "react"
import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import ZoneQuizSection from "@/components/ZoneQuizSection"
import PrequalQuizSection from "@/components/PrequalQuizSection"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { SupportChatWidget } from "@/components/chat/SupportChatWidget"

type FlowType = "none" | "zone" | "prequal"

export default function HomePage() {
  const [flow, setFlow] = useState<FlowType>("none")

  return (
    <>
      <Header />

      <div className="h-20" />

      <div className="fixed inset-0 -z-10 bg-white" aria-hidden="true" />

      <div className="relative overflow-hidden">
        <section
          id="inicio"
          aria-label={
            flow === "none"
              ? "Herramientas de búsqueda inmobiliaria"
              : flow === "zone"
                ? "Quiz de zona ideal"
                : "Quiz de precalificación crediticia"
          }
        >
          {flow === "none" && <HeroSection onSelectFlow={setFlow} />}
          {flow === "zone" && <ZoneQuizSection onBack={() => setFlow("none")} />}
          {flow === "prequal" && <PrequalQuizSection onBack={() => setFlow("none")} />}
        </section>
      </div>

      <WhatsAppButton />
      <SupportChatWidget />
    </>
  )
}
