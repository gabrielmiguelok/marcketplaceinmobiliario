"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { verifyAuthentication } from "@/lib/auth-client"
import AdminUsersClient from "./client"

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const result = await verifyAuthentication({
        redirectUrl: "/login",
        forceCheck: true,
      })

      if (result?.authenticated && result?.user) {
        if (result.user.role !== 'admin') {
          if (result.user.role === 'doctor') {
            router.push(result.user.usuario ? `/${result.user.usuario}/administracion` : "/pendiente")
          } else if (result.user.role === 'paciente') {
            router.push("/admin/paciente")
          } else {
            router.push("/pendiente")
          }
          return
        }

        if (result.user.estado !== 'confirmado') {
          router.push("/pendiente")
          return
        }

        setUser(result.user)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <AdminUsersClient currentUser={user} />
}
