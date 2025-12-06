"use client"

import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"

export default function HomePage() {
  return (
    <>
      <Header />

      <div className="fixed inset-0 -z-10 bg-white" />

      <main className="relative overflow-hidden">
        <section id="inicio">
          <HeroSection />
        </section>
      </main>
    </>
  )
}
