"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

interface NavLinkProps {
  text: string
  isBold?: boolean
  href?: string
}

function NavLink({ text, isBold = false, href = "#" }: NavLinkProps) {
  return (
    <a
      href={href}
      className={`text-[#0B1B32] hover:text-[#00F0D0] transition-colors duration-200 text-[15px] ${
        isBold ? "font-bold" : "font-medium"
      }`}
    >
      {text}
    </a>
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

interface HeaderProps {
  userInitials?: string
}

export default function Header({ userInitials = "SK" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="w-full max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between relative z-50 bg-white">
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          <span className="text-4xl font-semibold tracking-tight leading-none flex items-center gap-0 text-[#0B1B32]">
            <span className="relative inline-block">
              a
              <div className="absolute top-[6px] left-[3px] w-[6px] h-[6px] bg-white rounded-full" />
            </span>
            loba
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-10 lg:space-x-14 absolute left-1/2 transform -translate-x-1/2">
          <NavLink text="Proyectos nuevos" />
          <NavLink text="Conócenos" />
          <NavLink text="Herramientas" isBold={true} />
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
          <NavLink text="Proyectos nuevos" />
          <NavLink text="Conócenos" />
          <NavLink text="Herramientas" isBold={true} />
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
