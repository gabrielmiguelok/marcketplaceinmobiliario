"use client"

import Image from "next/image"
import Link from "next/link"

const IconFacebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const IconInstagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.5" y1="6.5" y2="6.5"/>
  </svg>
)

const IconTwitter = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.6.7 8.3 8.4 4h.6c2.4 0 4.5.9 6 2.8 1.4-.2 2.7-.8 3.8-1.7zm-2.8 4.2c-.7-.3-1.4-.4-2.2-.4C14.1 6 12 6.5 10 7.8c-2.7 1.8-4.7 4.8-5.3 8.3 2.5-.5 4.8-1.5 6.4-3.1 1.6-1.6 2.6-3.8 3.1-6 2.3.6 4.3 2.1 5.3 4.2 0 0 1.3-1.8 1.4-3.7z"/>
  </svg>
)

const IconLinkedIn = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
  </svg>
)

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="w-full bg-white">

      {/* Banner CTA */}
      <section className="w-full max-w-[1440px] mx-auto px-6 py-20 md:py-28 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#0B1B32]">
          Tu inversión inmobiliaria empieza aquí
        </h2>
        <p className="text-lg md:text-xl font-medium opacity-80 mb-10 text-[#0B1B32]">
          Explora, compara y encuentra tu próximo proyecto con aloba
        </p>
        <button className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md">
          Empezar ahora!
        </button>
      </section>

      <div className="w-full h-[1px] bg-gray-200"></div>

      {/* Footer Principal */}
      <footer className="w-full max-w-[1440px] mx-auto px-6 py-10 md:py-16">

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 md:gap-8">

          {/* Logo */}
          <div className="flex-shrink-0 mb-8 md:mb-0">
            <Link href="/">
              <Image
                src="/aloba-logo.png"
                alt="Aloba - Marketplace Inmobiliario"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Enlaces: Qué es aloba */}
          <div className="flex flex-col space-y-3 w-full max-w-[200px] md:w-auto">
            <span className="font-bold text-lg mb-1 opacity-90 text-[#0B1B32]">
              Qué es aloba
            </span>
            <Link href="/conocenos" className="text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
              Explorar proyectos
            </Link>
            <Link href="/herramientas" className="text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
              Herramientas
            </Link>
          </div>

          {/* Enlaces: Contacto */}
          <div className="flex flex-col space-y-3 w-full max-w-[250px] md:w-auto">
            <span className="font-bold text-lg mb-1 opacity-90 text-[#0B1B32]">
              Escribir un mensaje
            </span>
            <a href="#" className="text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
              Contactar con desarrollador
            </a>
            <a href="#" className="text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
              Quiero publicar con aloba
            </a>
          </div>

        </div>

        {/* Copyright y Redes Sociales */}
        <div className="mt-16 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm font-medium">

          <p className="mb-4 md:mb-0 text-gray-500">
            ©{currentYear} Aloba. Todos los derechos reservados.
          </p>

          <div className="flex space-x-5 text-gray-500">
            <a href="#" className="hover:text-[#0B1B32] transition-colors">
              <IconFacebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-[#0B1B32] transition-colors">
              <IconInstagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-[#0B1B32] transition-colors">
              <IconTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-[#0B1B32] transition-colors">
              <IconLinkedIn className="w-5 h-5" />
            </a>
          </div>

        </div>
      </footer>

    </div>
  )
}
