"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface NavLinkProps {
  text: string
  isActive?: boolean
  href?: string
}

function NavLink({ text, isActive = false, href = "#" }: NavLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
      className={`text-[#0B1B32] hover:text-[#00F0D0] transition-colors duration-200 text-[15px] ${
        isActive ? "font-bold" : "font-medium"
      }`}
    >
      {text}
    </Link>
  )
}

interface UserBadgeProps {
  initials: string
}

function UserBadge({ initials }: UserBadgeProps) {
  return (
    <button
      aria-label={`Perfil de usuario ${initials}`}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00F0D0] text-[#0B1B32] font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
    >
      {initials}
    </button>
  )
}

type ActivePage = "conocenos" | "herramientas" | "proyectos" | null

interface HeaderProps {
  userInitials?: string
  activePage?: ActivePage
}

export default function Header({ userInitials = "SK", activePage = null }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isMobileMenuOpen])

  return (
    <>
      <nav
        role="navigation"
        aria-label="Navegación principal"
        className="w-full max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between relative z-50 bg-white"
      >
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/aloba-logo.png"
            alt="Aloba - Marketplace Inmobiliario"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div
          role="menu"
          className="hidden md:flex items-center space-x-10 lg:space-x-14 absolute left-1/2 transform -translate-x-1/2"
        >
          <NavLink text="Proyectos nuevos" href="/proyectos" isActive={activePage === "proyectos"} />
          <NavLink text="Conócenos" href="/conocenos" isActive={activePage === "conocenos"} />
          <NavLink text="Herramientas" href="/herramientas" isActive={activePage === "herramientas"} />
        </div>

        <div className="hidden md:flex items-center space-x-6 font-bold text-sm text-[#0B1B32]">
          <button aria-label="Cambiar idioma a español" className="hover:text-[#00F0D0] transition-colors">
            ES
          </button>
          <button aria-label="Cambiar moneda a dólares" className="hover:text-[#00F0D0] transition-colors">
            $
          </button>
          <UserBadge initials={userInitials} />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className="text-[#0B1B32] focus:outline-none p-2"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        role="menu"
        aria-hidden={!isMobileMenuOpen}
        className={`md:hidden absolute top-[80px] left-0 w-full bg-white shadow-lg z-40 px-6 py-8 flex-col space-y-6 border-t border-gray-100 ${
          isMobileMenuOpen ? "flex" : "hidden"
        }`}
      >
        <NavLink text="Proyectos nuevos" href="/proyectos" isActive={activePage === "proyectos"} />
        <NavLink text="Conócenos" href="/conocenos" isActive={activePage === "conocenos"} />
        <NavLink text="Herramientas" href="/herramientas" isActive={activePage === "herramientas"} />
        <div className="h-px bg-gray-100 w-full my-4" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <div className="flex space-x-4 font-bold text-[#0B1B32]">
            <button aria-label="Cambiar idioma a español">ES</button>
            <button aria-label="Cambiar moneda a dólares">$</button>
          </div>
          <UserBadge initials={userInitials} />
        </div>
      </div>
    </>
  )
}
