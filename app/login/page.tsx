"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Stethoscope, User, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type RegistrationType = 'doctor' | 'paciente' | null

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null)

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
              } else if (data.user?.role === 'doctor') {
                router.push(data.user?.usuario ? `/${data.user.usuario}/administracion` : "/pendiente")
              } else if (data.user?.role === 'paciente') {
                router.push("/admin/paciente")
              } else {
                router.push("/pendiente")
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

  const handleGoogleLogin = async (type?: RegistrationType) => {
    setIsLoading(true)
    setError("")
    try {
      // Siempre redirigir a /post-login que se encarga de la redirección inteligente
      let redirectPath = '/post-login'
      if (type === 'doctor') {
        redirectPath = '/doctor-setup'
      } else if (type === 'paciente') {
        redirectPath = '/post-login'
      }
      const roleParam = type ? `&role=${type}` : ''
      window.location.href = `/api/auth/google?redirect=${redirectPath}${roleParam}`
    } catch (error) {
      setError("Error al conectar con Google")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7BA3DB 0%, #6B9EF2 50%, #7DD4F5 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/90">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #7BA3DB 0%, #6B9EF2 50%, #7DD4F5 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-6 pb-6 text-center">
              <div className="flex justify-center">
                <Link href="/">
                  <Image
                    src="/logo-largo.svg"
                    alt="DocTop"
                    width={180}
                    height={50}
                    className="h-12 w-auto"
                    style={{ filter: 'brightness(0) saturate(100%) invert(56%) sepia(52%) saturate(456%) hue-rotate(182deg) brightness(91%) contrast(87%)' }}
                  />
                </Link>
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                  Bienvenido a DocTop
                </CardTitle>
                <CardDescription className="text-gray-500 mt-2">
                  {registrationType
                    ? `Registrándote como ${registrationType === 'doctor' ? 'Profesional de la Salud' : 'Paciente'}`
                    : 'Inicia sesión o regístrate para continuar'
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {!registrationType ? (
                <>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center font-medium">¿Ya tienes cuenta?</p>
                    <Button
                      onClick={() => handleGoogleLogin()}
                      disabled={isLoading}
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md rounded-xl"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {isLoading ? "Conectando..." : "Iniciar sesión con Google"}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-gray-400">¿Nuevo en DocTop?</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center font-medium">Regístrate como:</p>

                    <Button
                      onClick={() => setRegistrationType('doctor')}
                      variant="outline"
                      className="w-full h-14 justify-start px-4 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">Profesional de la Salud</div>
                        <div className="text-xs text-gray-500">Médicos, especialistas, clínicas</div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setRegistrationType('paciente')}
                      variant="outline"
                      className="w-full h-14 justify-start px-4 border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/5 rounded-xl transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">Paciente</div>
                        <div className="text-xs text-gray-500">Busca médicos y agenda citas</div>
                      </div>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      {registrationType === 'doctor' ? (
                        <Stethoscope className="w-6 h-6 text-primary" />
                      ) : (
                        <User className="w-6 h-6 text-secondary" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">
                          {registrationType === 'doctor' ? 'Registro de Profesional' : 'Registro de Paciente'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {registrationType === 'doctor'
                            ? 'Tu cuenta será verificada por nuestro equipo'
                            : 'Acceso inmediato a la plataforma'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleGoogleLogin(registrationType)}
                    disabled={isLoading}
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md rounded-xl"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {isLoading ? "Registrando..." : "Continuar con Google"}
                  </Button>

                  <Button
                    onClick={() => setRegistrationType(null)}
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-gray-700"
                  >
                    ← Volver a opciones
                  </Button>
                </>
              )}

              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Al continuar, aceptas nuestros{" "}
                  <Link href="/terminos" className="text-primary hover:underline">
                    Términos de Servicio
                  </Link>{" "}
                  y{" "}
                  <Link href="/privacidad" className="text-primary hover:underline">
                    Política de Privacidad
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link href="/" className="text-white/80 hover:text-white text-sm transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs text-white/70">
          © 2025 DocTop. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
