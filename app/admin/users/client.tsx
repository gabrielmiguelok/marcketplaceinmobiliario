"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, LogOut, Shield } from "lucide-react"
import { buildColumnsFromDefinition } from "@/CustomTable/CustomTableColumnsConfig"
import CustomTable from "@/CustomTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface UserRow {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  google_id: string | null
  locale: string | null
  role: string
  estado: string
  telefono: string | null
  especialidad: string | null
  last_login: string | null
  created_at: string
  updated_at: string
  _isUpdating?: boolean
}

interface AdminUsersClientProps {
  currentUser: any
}

const usersFieldsDefinition = {
  email: { type: 'text' as const, header: 'EMAIL', width: 250, editable: false },
  full_name: { type: 'text' as const, header: 'NOMBRE COMPLETO', width: 180 },
  first_name: { type: 'text' as const, header: 'NOMBRE', width: 120 },
  last_name: { type: 'text' as const, header: 'APELLIDO', width: 120 },
  telefono: { type: 'text' as const, header: 'TELÉFONO', width: 130 },
  especialidad: { type: 'text' as const, header: 'ESPECIALIDAD', width: 150 },
  role: {
    type: 'badge' as const,
    header: 'ROL',
    width: 120,
    options: [
      { value: 'user', label: 'Usuario' },
      { value: 'admin', label: 'Admin' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'paciente', label: 'Paciente' },
    ]
  },
  estado: {
    type: 'badge' as const,
    header: 'ESTADO',
    width: 130,
    options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'confirmado', label: 'Confirmado' },
    ]
  },
  last_login: { type: 'text' as const, header: 'ÚLTIMO LOGIN', width: 150, editable: false },
  created_at: { type: 'text' as const, header: 'REGISTRADO', width: 150, editable: false },
}

const usersColumns = buildColumnsFromDefinition(usersFieldsDefinition)

export default function AdminUsersClient({ currentUser }: AdminUsersClientProps) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users/list")
      const data = await response.json()

      if (data.success) {
        setUsers(
          data.users.map((u: any) => ({
            ...u,
            id: String(u.id),
            full_name: u.full_name || "",
            first_name: u.first_name || "",
            last_name: u.last_name || "",
            google_id: u.google_id || "",
            locale: u.locale || "",
            telefono: u.telefono || "",
            especialidad: u.especialidad || "",
            role: u.role || "user",
            estado: u.estado || "pendiente",
            last_login: u.last_login ? new Date(u.last_login).toLocaleString('es-MX') : '-',
            created_at: new Date(u.created_at).toLocaleString('es-MX'),
            updated_at: new Date(u.updated_at).toLocaleString('es-MX'),
          })),
        )
      } else {
        setAlert({ type: "error", message: "Error al cargar usuarios" })
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error)
      setAlert({ type: "error", message: "Error al cargar usuarios" })
    } finally {
      setLoading(false)
    }
  }

  const handleCellEdit = async (rowId: string, colId: string, newValue: string) => {
    const currentUser = users.find(c => String(c.id) === String(rowId))
    if (!currentUser) return

    const oldValue = currentUser[colId as keyof UserRow]
    if (oldValue === newValue) return

    setUsers(prev =>
      prev.map(c =>
        String(c.id) === String(rowId)
          ? { ...c, [colId]: newValue, _isUpdating: true }
          : c
      )
    )

    try {
      const response = await fetch('/api/admin/users/update-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: rowId,
          field: colId,
          value: newValue
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar')
      }

      setUsers(prev =>
        prev.map(c =>
          String(c.id) === String(rowId)
            ? { ...c, [colId]: data.data.value, _isUpdating: false }
            : c
        )
      )

      setAlert({
        type: "success",
        message: `${usersFieldsDefinition[colId as keyof typeof usersFieldsDefinition]?.header || colId} actualizado`
      })

      setTimeout(() => setAlert(null), 2000)

    } catch (error: any) {
      setUsers(prev =>
        prev.map(c =>
          String(c.id) === String(rowId)
            ? { ...c, [colId]: oldValue, _isUpdating: false }
            : c
        )
      )

      setAlert({
        type: "error",
        message: `Error al actualizar: ${error.message || 'Intenta nuevamente'}`
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/25">
              <RefreshCw className="h-7 w-7 animate-spin text-white" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-5">
              <Link href="/" className="transition-transform hover:scale-105">
                <Image
                  src="/logo-largo.svg"
                  alt="DocTop"
                  width={130}
                  height={36}
                  className="h-8 w-auto"
                  style={{ filter: 'brightness(0) saturate(100%) invert(56%) sepia(52%) saturate(456%) hue-rotate(182deg) brightness(91%) contrast(87%)' }}
                />
              </Link>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                  Administrador
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800">{currentUser?.fullName || currentUser?.email}</p>
                <p className="text-xs text-slate-500">Panel de Control</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2 text-slate-500" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
        {alert && (
          <Alert
            className={`mb-4 border-0 shadow-lg ${
              alert.type === "success"
                ? "bg-emerald-50 shadow-emerald-100"
                : alert.type === "info"
                  ? "bg-blue-50 shadow-blue-100"
                  : "bg-red-50 shadow-red-100"
            }`}
          >
            <AlertDescription
              className={`font-medium ${
                alert.type === "success"
                  ? "text-emerald-700"
                  : alert.type === "info"
                    ? "text-blue-700"
                    : "text-red-700"
              }`}
            >
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden" style={{ height: 'calc(100vh - 140px)', minHeight: '500px' }}>
          <CustomTable
            data={users}
            columnsDef={usersColumns}
            pageSize={500}
            loading={false}
            showFiltersToolbar={true}
            containerHeight="100%"
            rowHeight={14}
            loadingText="Cargando usuarios..."
            noResultsText="No se encontraron usuarios"
            onCellEdit={handleCellEdit}
            onRefresh={loadUsers}
          />
        </div>
      </main>
    </div>
  )
}
