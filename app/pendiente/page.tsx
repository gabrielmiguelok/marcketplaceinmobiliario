"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PendientePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            if (data.user.estado === "confirmado") {
              if (data.user.role === "admin") {
                router.push("/admin/users")
              } else {
                router.push("/")
              }
              return
            }
            setUser(data.user)
          } else {
            router.push("/login")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00F0D0]/20 via-background to-[#0B1B32]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0D0] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#00F0D0]/20 via-background to-[#0B1B32]/10">
      <Card className="w-full max-w-md shadow-2xl border border-border bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Cuenta Pendiente
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Tu cuenta esta siendo revisada por nuestro equipo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Email:</span> {user.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">Estado:</span>{" "}
              <span className="text-amber-500">Pendiente de aprobacion</span>
            </p>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Te notificaremos por email cuando tu cuenta sea aprobada.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>

            <Button variant="ghost" onClick={handleLogout} className="w-full text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
