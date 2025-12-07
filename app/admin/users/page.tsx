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
      try {
        const result = await verifyAuthentication({
          redirectUrl: "/login",
          forceCheck: true,
        })

        if (result?.authenticated && result?.user) {
          if (result.user.role !== 'admin') {
            console.log("[admin/users] User is not admin, redirecting")
            router.push("/")
            return
          }

          setUser(result.user)
          setIsLoading(false)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("[admin/users] Auth check failed:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso de administrador...</p>
        </div>
      </div>
    )
  }

  return <AdminUsersClient user={user} />
}
