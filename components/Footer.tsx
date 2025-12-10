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

      {/* Banner CTA - Compacto en mobile */}
      <aside className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 md:py-28 text-center" role="banner">
        <h2 className="text-xl sm:text-2xl md:text-5xl font-extrabold tracking-tight mb-2 md:mb-4 text-[#0B1B32]">
          Tu inversión inmobiliaria empieza aquí
        </h2>
        <p className="text-sm md:text-xl font-medium opacity-80 mb-5 md:mb-10 text-[#0B1B32]">
          Explora, compara y encuentra tu próximo proyecto
        </p>
        <Link href="/login" className="inline-block bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-sm md:text-lg py-2.5 px-6 md:py-4 md:px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md" aria-label="Empezar a explorar propiedades ahora">
          Empezar ahora!
        </Link>
      </aside>

      <div className="w-full h-[1px] bg-gray-200"></div>

      {/* Footer Principal - Compacto en mobile */}
      <footer className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-16" role="contentinfo">

        {/* Mobile: Logo centrado + enlaces en grid 2 columnas */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 md:gap-8">

          {/* Logo - Centrado en mobile */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <Link href="/">
              <Image
                src="/aloba-logo.png"
                alt="Aloba - Marketplace Inmobiliario"
                width={100}
                height={33}
                className="h-8 md:h-10 w-auto"
              />
            </Link>
          </div>

          {/* Enlaces en grid 2 columnas en mobile */}
          <div className="grid grid-cols-2 gap-4 md:flex md:gap-16">
            {/* Enlaces: Qué es aloba */}
            <nav className="flex flex-col space-y-2" aria-label="Navegación sobre Aloba">
              <span className="font-bold text-sm md:text-lg mb-0.5 md:mb-1 opacity-90 text-[#0B1B32]">
                Qué es aloba
              </span>
              <Link href="/conocenos" className="text-xs md:text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
                Explorar proyectos
              </Link>
              <Link href="/herramientas" className="text-xs md:text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
                Herramientas
              </Link>
            </nav>

            {/* Enlaces: Contacto */}
            <nav className="flex flex-col space-y-2" aria-label="Navegación de contacto">
              <span className="font-bold text-sm md:text-lg mb-0.5 md:mb-1 opacity-90 text-[#0B1B32]">
                Contacto
              </span>
              <a href="#" className="text-xs md:text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
                Desarrolladores
              </a>
              <a href="#" className="text-xs md:text-base text-[#0B1B32] hover:text-[#00F0D0] transition-colors">
                Publicar en aloba
              </a>
            </nav>
          </div>

        </div>

        {/* Copyright y Redes Sociales - Compacto en mobile */}
        <div className="mt-6 md:mt-16 pt-4 md:pt-6 border-t border-gray-100 flex flex-col-reverse md:flex-row justify-between items-center gap-3 text-xs md:text-sm font-medium">

          <p className="text-gray-500 text-center">
            ©{currentYear} Aloba. Todos los derechos reservados.
          </p>

          <div className="flex space-x-4 md:space-x-5 text-gray-500">
            <a href="#" className="hover:text-[#0B1B32] transition-colors" aria-label="Síguenos en Facebook" title="Síguenos en Facebook" target="_blank" rel="noopener noreferrer">
              <IconFacebook className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#" className="hover:text-[#0B1B32] transition-colors" aria-label="Síguenos en Instagram" title="Síguenos en Instagram" target="_blank" rel="noopener noreferrer">
              <IconInstagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#" className="hover:text-[#0B1B32] transition-colors" aria-label="Síguenos en Twitter" title="Síguenos en Twitter" target="_blank" rel="noopener noreferrer">
              <IconTwitter className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#" className="hover:text-[#0B1B32] transition-colors" aria-label="Síguenos en LinkedIn" title="Síguenos en LinkedIn" target="_blank" rel="noopener noreferrer">
              <IconLinkedIn className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>

        </div>
      </footer>

    </div>
  )
}
