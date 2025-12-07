"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00F0D0]/20 via-background to-[#0B1B32]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0D0] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando sesion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#00F0D0]/20 via-background to-[#0B1B32]/10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border border-border bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-6 pb-6 text-center">
              <div className="flex justify-center">
                <Link href="/" className="flex items-center gap-2 text-[#00F0D0] hover:opacity-80 transition-opacity">
                  <Home className="h-8 w-8" />
                  <span className="text-2xl font-bold text-foreground">Aloba</span>
                </Link>
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                  Bienvenido a Aloba
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Inicia sesion para continuar
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/20 bg-green-500/10 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md rounded-xl"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isLoading ? "Conectando..." : "Iniciar sesion con Google"}
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Al continuar, aceptas nuestros{" "}
                  <Link href="/terminos" className="text-[#00F0D0] hover:underline">
                    Terminos de Servicio
                  </Link>{" "}
                  y{" "}
                  <Link href="/privacidad" className="text-[#00F0D0] hover:underline">
                    Politica de Privacidad
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          2025 Aloba. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
