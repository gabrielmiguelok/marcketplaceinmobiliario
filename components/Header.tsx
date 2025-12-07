"use client"

import { useState } from "react"
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
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00F0D0] text-[#0B1B32] font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity">
      {initials}
    </div>
  )
}

type ActivePage = "conocenos" | "herramientas" | "proyectos" | null

interface HeaderProps {
  userInitials?: string
  activePage?: ActivePage
}

export default function Header({ userInitials = "SK", activePage = null }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="w-full max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between relative z-50 bg-white">
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

        <div className="hidden md:flex items-center space-x-10 lg:space-x-14 absolute left-1/2 transform -translate-x-1/2">
          <NavLink text="Proyectos nuevos" href="/proyectos" isActive={activePage === "proyectos"} />
          <NavLink text="Conócenos" href="/conocenos" isActive={activePage === "conocenos"} />
          <NavLink text="Herramientas" href="/herramientas" isActive={activePage === "herramientas"} />
        </div>

        <div className="hidden md:flex items-center space-x-6 font-bold text-sm text-[#0B1B32]">
          <button className="hover:text-[#00F0D0] transition-colors">ES</button>
          <button className="hover:text-[#00F0D0] transition-colors">$</button>
          <UserBadge initials={userInitials} />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#0B1B32] focus:outline-none p-2"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 w-full bg-white shadow-lg z-40 px-6 py-8 flex flex-col space-y-6 border-t border-gray-100">
          <NavLink text="Proyectos nuevos" href="/proyectos" isActive={activePage === "proyectos"} />
          <NavLink text="Conócenos" href="/conocenos" isActive={activePage === "conocenos"} />
          <NavLink text="Herramientas" href="/herramientas" isActive={activePage === "herramientas"} />
          <div className="h-px bg-gray-100 w-full my-4" />
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 font-bold text-[#0B1B32]">
              <button>ES</button>
              <button>$</button>
            </div>
            <UserBadge initials={userInitials} />
          </div>
        </div>
      )}
    </>
  )
}
