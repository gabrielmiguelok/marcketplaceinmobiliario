"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function PostLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Verificando tu cuenta...")

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            const user = data.user

            // Usuario pendiente de aprobación
            if (user.estado !== "confirmado") {
              router.push("/pendiente")
              return
            }

            // Admin → panel de administración
            if (user.role === "admin") {
              setStatus("Redirigiendo al panel de administración...")
              router.push("/admin/administracion")
              return
            }

            // Usuario confirmado con usuario asignado → su panel de inmuebles
            if (user.usuario) {
              setStatus("Redirigiendo a tu panel...")
              router.push(`/${user.usuario}/inmuebles`)
              return
            }

            // Usuario sin usuario asignado (no debería pasar)
            router.push("/pendiente")
            return
          }
        }

        router.push("/login")
      } catch (error) {
        console.error("Error in post-login:", error)
        router.push("/login")
      }
    }

    redirectUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00F0D0]/20 via-background to-[#0B1B32]/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0D0] mx-auto mb-4"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
