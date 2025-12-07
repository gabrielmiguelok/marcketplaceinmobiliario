"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import Link from "next/link"
import { Menu, Home, Building2, Wrench, Info, ChevronRight, Map } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

const navItems = [
  { name: "Inmuebles", href: "/inmuebles", icon: Building2 },
  { name: "Conócenos", href: "/conocenos", icon: Info },
  { name: "Herramientas", href: "/herramientas", icon: Wrench },
]

type ActivePage = "conocenos" | "herramientas" | "inmuebles" | null

interface HeaderProps {
  userInitials?: string
  activePage?: ActivePage
}

export default function Header({ userInitials = "SK", activePage = null }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${isScrolled ? "py-2" : "py-4"}`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div
          className={`mx-auto transition-all duration-500 ${
            isScrolled
              ? "max-w-7xl bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full shadow-lg px-4 sm:px-6 py-2"
              : "max-w-7xl bg-white px-4 sm:px-6 py-3"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00F0D0]/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src="/aloba-logo.png"
                  alt="Aloba - Marketplace Inmobiliario"
                  width={100}
                  height={34}
                  className={`relative transition-all duration-300 ${isScrolled ? "h-8 w-auto" : "h-10 w-auto"}`}
                  priority
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activePage === item.href.replace("/", "")
                      ? "bg-[#00F0D0]/10 text-[#0B1B32] font-bold"
                      : "text-[#0B1B32] hover:bg-[#00F0D0]/10 hover:text-[#0B1B32]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 text-sm font-bold text-[#0B1B32]">
                <button className="hover:text-[#00F0D0] transition-colors px-2 py-1">
                  ES
                </button>
                <button className="hover:text-[#00F0D0] transition-colors px-2 py-1">
                  $
                </button>
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00F0D0] text-[#0B1B32] font-bold text-sm hover:bg-[#00dbbe] transition-colors shadow-md"
                >
                  {userInitials}
                </button>
              </div>

              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="default"
                      className="p-2.5 rounded-full hover:bg-[#00F0D0]/10 border-2 border-gray-200"
                    >
                      <Menu className="h-6 w-6 text-[#0B1B32]" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-80 bg-white/98 backdrop-blur-md border-l border-gray-200 p-0"
                  >
                    <div className="flex flex-col h-full">
                      <div className="text-center pt-8 pb-6 px-6 border-b border-gray-100">
                        <div className="inline-flex items-center justify-center mb-4">
                          <Image
                            src="/aloba-logo.png"
                            alt="Aloba"
                            width={140}
                            height={47}
                            className="h-12 w-auto"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Encuentra tu próximo hogar
                        </p>
                      </div>

                      <nav className="flex-1 flex flex-col py-4 px-4">
                        <SheetClose asChild>
                          <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium transition-all text-[#0B1B32] hover:bg-[#00F0D0]/10 active:scale-[0.98]"
                          >
                            <Home className="w-5 h-5 text-[#00F0D0]" />
                            Inicio
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                          </Link>
                        </SheetClose>

                        {navItems.map((item) => {
                          const Icon = item.icon
                          const isActive = activePage === item.href.replace("/", "")
                          return (
                            <SheetClose asChild key={item.name}>
                              <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium transition-all active:scale-[0.98] ${
                                  isActive
                                    ? "bg-[#00F0D0]/15 text-[#0B1B32] font-bold"
                                    : "text-[#0B1B32] hover:bg-[#00F0D0]/10"
                                }`}
                              >
                                <Icon className={`w-5 h-5 ${isActive ? "text-[#00F0D0]" : "text-[#00F0D0]"}`} />
                                {item.name}
                                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                              </Link>
                            </SheetClose>
                          )
                        })}
                      </nav>

                      <div className="mt-auto border-t border-gray-100 p-4 space-y-3">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex gap-4">
                            <button className="text-sm font-bold text-[#0B1B32] hover:text-[#00F0D0] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                              ES
                            </button>
                            <button className="text-sm font-bold text-[#0B1B32] hover:text-[#00F0D0] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                              $
                            </button>
                          </div>
                          <button
                            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#00F0D0] text-[#0B1B32] font-bold text-sm hover:bg-[#00dbbe] transition-colors shadow-md"
                          >
                            {userInitials}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <SheetClose asChild>
                            <Button
                              asChild
                              className="flex-1 bg-[#00F0D0] text-[#0B1B32] hover:bg-[#00dbbe] rounded-full font-semibold shadow-md"
                            >
                              <Link href="/inmuebles" className="flex items-center justify-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Inmuebles
                              </Link>
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button
                              asChild
                              className="flex-1 bg-[#0B1B32] text-white hover:bg-[#0B1B32]/90 rounded-full font-semibold shadow-md"
                            >
                              <Link href="/inmuebles/mapa" className="flex items-center justify-center gap-2">
                                <Map className="w-4 h-4" />
                                Mapa
                              </Link>
                            </Button>
                          </SheetClose>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
