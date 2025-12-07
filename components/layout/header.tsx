"use client"

import Link from "next/link"
import { LogOut, User, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user?: {
    email: string
    firstName?: string
    lastName?: string
    role?: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Home className="h-5 w-5" />
            <span className="font-semibold">Aloba</span>
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin/users"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Gestión de Usuarios
            </Link>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {user.firstName || user.email}
              </span>
              {user.role && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                  {user.role}
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
