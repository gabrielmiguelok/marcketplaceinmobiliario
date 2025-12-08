"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, ArrowRight, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            if (data.user?.estado === 'confirmado') {
              if (data.user?.role === 'admin') {
                router.push("/admin/users")
              } else {
                router.push("/")
              }
            } else {
              router.push("/pendiente")
            }
            return
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    try {
      window.location.href = `/api/auth/google?redirect=/post-login`
    } catch (error) {
      setError("Error al conectar con Google")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#00F0D0] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[#0B1B32]/60 font-medium">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#0B1B32] flex flex-col relative selection:bg-[#00F0D0] selection:text-[#0B1B32]">
      <Header />

      <div className="h-20" />

      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Column - Branding */}
            <div className="hidden lg:flex flex-col">
              <div className="relative">
                {/* Decorative background */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#00F0D0]/20 via-[#00F0D0]/5 to-transparent rounded-[3rem] blur-2xl"></div>

                <div className="relative bg-gradient-to-br from-[#0B1B32] to-[#0B1B32]/90 rounded-[2.5rem] p-10 overflow-hidden">
                  {/* Pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                      backgroundSize: '24px 24px'
                    }}
                  />

                  {/* Accent glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0D0]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                      <Sparkles className="w-5 h-5 text-[#00F0D0]" />
                      <span className="text-[#00F0D0] font-semibold text-sm uppercase tracking-wider">Marketplace Inmobiliario</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      Encuentra tu próximo
                      <span className="block text-[#00F0D0]">hogar ideal</span>
                    </h2>

                    <p className="text-white/70 text-lg mb-8 leading-relaxed">
                      Accede a las mejores propiedades en Ciudad de Guatemala. Compara, explora y toma decisiones informadas.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="w-8 h-8 rounded-full bg-[#00F0D0]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-[#00F0D0]" />
                        </div>
                        <span>Propiedades verificadas y actualizadas</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="w-8 h-8 rounded-full bg-[#00F0D0]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-[#00F0D0]" />
                        </div>
                        <span>Herramientas inteligentes de búsqueda</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="w-8 h-8 rounded-full bg-[#00F0D0]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-[#00F0D0]" />
                        </div>
                        <span>Asistente IA para encontrar tu match</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              {/* Mobile Logo */}
              <div className="flex justify-center lg:hidden mb-8">
                <Image
                  src="/aloba-logo.png"
                  alt="Aloba"
                  width={140}
                  height={47}
                  className="h-12 w-auto"
                  priority
                />
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-8 md:p-10">
                <div className="text-center mb-8">
                  {/* Desktop Logo */}
                  <div className="hidden lg:flex justify-center mb-6">
                    <Image
                      src="/aloba-logo.png"
                      alt="Aloba"
                      width={120}
                      height={40}
                      className="h-10 w-auto"
                      priority
                    />
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-[#0B1B32] mb-2">
                    Bienvenido
                  </h1>
                  <p className="text-[#0B1B32]/60">
                    Inicia sesión para continuar
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6 rounded-xl border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-6 rounded-xl border-green-200 bg-green-50 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-14 bg-white hover:bg-gray-50 text-[#0B1B32] border-2 border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md rounded-2xl font-semibold text-base group"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-[#0B1B32]/30 border-t-[#0B1B32] rounded-full animate-spin mr-2"></div>
                      Conectando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Continuar con Google
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-6 text-sm text-[#0B1B32]/50">
                  <Shield className="w-4 h-4" />
                  <span>Conexión segura y encriptada</span>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-[#0B1B32]/50 leading-relaxed">
                    Al continuar, aceptas nuestros{" "}
                    <Link href="/terminos" className="text-[#00F0D0] hover:underline font-medium">
                      Términos de Servicio
                    </Link>{" "}
                    y{" "}
                    <Link href="/privacidad" className="text-[#00F0D0] hover:underline font-medium">
                      Política de Privacidad
                    </Link>
                  </p>
                </div>
              </div>

              {/* Mobile benefits */}
              <div className="lg:hidden mt-8 space-y-3">
                <div className="flex items-center gap-3 text-[#0B1B32]/70 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#00F0D0]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-[#00F0D0]" />
                  </div>
                  <span>Propiedades verificadas</span>
                </div>
                <div className="flex items-center gap-3 text-[#0B1B32]/70 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#00F0D0]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-[#00F0D0]" />
                  </div>
                  <span>Herramientas inteligentes de búsqueda</span>
                </div>
                <div className="flex items-center gap-3 text-[#0B1B32]/70 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#00F0D0]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-[#00F0D0]" />
                  </div>
                  <span>Asistente IA personalizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
