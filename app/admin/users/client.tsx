"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"
import { buildColumnsFromDefinition } from "@/components/CustomTable/CustomTableColumnsConfig"
import CustomTable from "@/components/CustomTable"
import { Header } from "@/components/layout/header"

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
  last_login: string | null
  created_at: string
  updated_at: string
  _isUpdating?: boolean
}

interface AdminUsersClientProps {
  user: any
}

const usersFieldsDefinition = {
  email: { type: 'text' as const, header: 'EMAIL', width: 250, editable: false },
  full_name: { type: 'text' as const, header: 'NOMBRE COMPLETO', width: 200 },
  first_name: { type: 'text' as const, header: 'NOMBRE', width: 120 },
  last_name: { type: 'text' as const, header: 'APELLIDO', width: 120 },
  role: {
    type: 'badge' as const,
    header: 'ROL',
    width: 120,
    options: [
      { value: 'user', label: 'Usuario' },
      { value: 'admin', label: 'Admin' },
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
  last_login: { type: 'text' as const, header: 'ÚLTIMO LOGIN', width: 160, editable: false },
  created_at: { type: 'text' as const, header: 'REGISTRADO', width: 160, editable: false },
}

const usersColumns = buildColumnsFromDefinition(usersFieldsDefinition)

export default function AdminUsersClient({ user }: AdminUsersClientProps) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

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
            role: u.role || "user",
            estado: u.estado || "pendiente",
            last_login: u.last_login ? new Date(u.last_login).toLocaleString('es-AR') : '-',
            created_at: new Date(u.created_at).toLocaleString('es-AR'),
            updated_at: new Date(u.updated_at).toLocaleString('es-AR'),
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

  const headerUser = user ? {
    email: user.email,
    firstName: user.firstName || user.first_name,
    lastName: user.lastName || user.last_name,
    role: user.role,
  } : null

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <Header user={headerUser} />

      <div className="flex-1 flex flex-col overflow-hidden pt-20 relative z-10">
        <div className="flex-none px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {users.length} usuarios registrados
              </p>
            </div>
          </div>

          {alert && (
            <Alert
              className={`mt-4 ${
                alert.type === "success"
                  ? "border-green-500/20 bg-green-500/10"
                  : alert.type === "info"
                    ? "border-primary/20 bg-primary/10"
                    : "border-destructive/20 bg-destructive/10"
              }`}
            >
              <AlertDescription
                className={
                  alert.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : alert.type === "info"
                      ? "text-primary"
                      : "text-destructive"
                }
              >
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 p-3 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Estado:</span> Cambia a "Confirmado" para dar acceso al sistema.
              <span className="font-medium text-foreground ml-4">Rol:</span> "Admin" puede gestionar usuarios.
            </p>
          </div>
        </div>

        <div className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full bg-card rounded-xl border border-border overflow-hidden">
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
        </div>
      </div>
    </div>
  )
}
