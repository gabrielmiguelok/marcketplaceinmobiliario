"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Users, Building2, RefreshCw, Plus, LogOut, X } from "lucide-react"
import toast from "react-hot-toast"
import { verifyAuthentication } from "@/lib/auth-client"
import CustomTable from "@/components/CustomTable"
import { buildColumnsFromDefinition, ColumnFieldsDefinition } from "@/components/CustomTable/CustomTableColumnsConfig"
import Image from "next/image"

interface User {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  role: string
  estado: string
  last_login: string | null
  created_at: string
}

interface Inmueble {
  id: number
  titulo: string
  descripcion: string
  tipo: string
  operacion: string
  precio: number
  moneda: string
  ubicacion: string
  zona: string
  departamento: string
  metros_cuadrados: number
  habitaciones: number
  banos: number
  parqueos: number
  imagen_url: string | null
  destacado: boolean
  estado: string
  latitud: number | null
  longitud: number | null
  created_at: string
  updated_at: string
}

const usersFields: ColumnFieldsDefinition = {
  email: { type: 'text', header: 'EMAIL', width: 250, editable: false },
  full_name: { type: 'text', header: 'NOMBRE COMPLETO', width: 200 },
  first_name: { type: 'text', header: 'NOMBRE', width: 120 },
  last_name: { type: 'text', header: 'APELLIDO', width: 120 },
  role: {
    type: 'badge',
    header: 'ROL',
    width: 120,
    options: [
      { value: 'user', label: 'Usuario' },
      { value: 'admin', label: 'Admin' },
    ]
  },
  estado: {
    type: 'badge',
    header: 'ESTADO',
    width: 130,
    options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'confirmado', label: 'Confirmado' },
    ]
  },
  last_login: { type: 'text', header: 'ÚLTIMO LOGIN', width: 160, editable: false },
  created_at: { type: 'text', header: 'REGISTRADO', width: 160, editable: false },
}

const getInmueblesColumns = (onImageUpload?: (rowId: string, file: File) => Promise<void>) => buildColumnsFromDefinition({
  imagen_url: {
    type: 'image',
    header: '',
    width: 60,
    imageSize: 44,
    onImageUpload,
  },
  id: {
    type: 'numeric',
    header: 'ID',
    width: 60,
    editable: false,
  },
  titulo: {
    type: 'text',
    header: 'TÍTULO',
    width: 200,
  },
  tipo: {
    type: 'badge',
    header: 'TIPO',
    width: 120,
    options: [
      { value: 'apartamento', label: 'Apartamento' },
      { value: 'casa', label: 'Casa' },
      { value: 'terreno', label: 'Terreno' },
      { value: 'oficina', label: 'Oficina' },
      { value: 'local', label: 'Local' },
      { value: 'bodega', label: 'Bodega' },
    ]
  },
  operacion: {
    type: 'badge',
    header: 'OPERACIÓN',
    width: 100,
    options: [
      { value: 'venta', label: 'Venta' },
      { value: 'alquiler', label: 'Alquiler' },
    ]
  },
  precio: {
    type: 'currency',
    header: 'PRECIO',
    width: 120,
  },
  moneda: {
    type: 'badge',
    header: 'MONEDA',
    width: 80,
    options: [
      { value: 'USD', label: 'USD' },
      { value: 'GTQ', label: 'GTQ' },
    ]
  },
  zona: {
    type: 'text',
    header: 'ZONA',
    width: 100,
  },
  ubicacion: {
    type: 'text',
    header: 'UBICACIÓN',
    width: 180,
  },
  metros_cuadrados: {
    type: 'numeric',
    header: 'M²',
    width: 80,
  },
  habitaciones: {
    type: 'numeric',
    header: 'HAB',
    width: 60,
  },
  banos: {
    type: 'numeric',
    header: 'BAÑOS',
    width: 60,
  },
  parqueos: {
    type: 'numeric',
    header: 'PARQ',
    width: 60,
  },
  destacado: {
    type: 'badge',
    header: 'DEST',
    width: 80,
    options: [
      { value: true, label: 'Sí' },
      { value: false, label: 'No' },
    ]
  },
  estado: {
    type: 'badge',
    header: 'ESTADO',
    width: 110,
    options: [
      { value: 'disponible', label: 'Disponible' },
      { value: 'vendido', label: 'Vendido' },
      { value: 'reservado', label: 'Reservado' },
      { value: 'inactivo', label: 'Inactivo' },
    ]
  },
  latitud: {
    type: 'numeric',
    header: 'LAT',
    width: 100,
  },
  longitud: {
    type: 'numeric',
    header: 'LNG',
    width: 100,
  },
})

const usersColumns = buildColumnsFromDefinition(usersFields)

type TabType = 'usuarios' | 'inmuebles'

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'usuarios', label: 'Usuarios', icon: <Users className="w-4 h-4" /> },
  { id: 'inmuebles', label: 'Inmuebles', icon: <Building2 className="w-4 h-4" /> },
]

export default function AdministracionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('usuarios')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [inmueblesLoading, setInmueblesLoading] = useState(false)
  const [addRecordState, setAddRecordState] = useState<'idle' | 'adding' | 'saving'>('idle')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await verifyAuthentication({
          redirectUrl: "/login",
          forceCheck: true,
        })

        if (result?.authenticated && result?.user) {
          if (result.user.role !== 'admin') {
            router.push("/")
            return
          }
          setCurrentUser(result.user)
          setIsAuthenticated(true)
        } else {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
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
            role: u.role || "user",
            estado: u.estado || "pendiente",
            last_login: u.last_login ? new Date(u.last_login).toLocaleString('es-GT') : '-',
            created_at: new Date(u.created_at).toLocaleString('es-GT'),
          }))
        )
      }
    } catch (error) {
      toast.error("Error al cargar usuarios")
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const loadInmuebles = useCallback(async () => {
    setInmueblesLoading(true)
    try {
      const response = await fetch('/api/inmuebles')
      if (!response.ok) throw new Error('Error al cargar inmuebles')
      const data = await response.json()
      setInmuebles(data)
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos')
    } finally {
      setInmueblesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'usuarios') {
        loadUsers()
      } else if (activeTab === 'inmuebles') {
        loadInmuebles()
      }
    }
  }, [activeTab, isAuthenticated, loadUsers, loadInmuebles])

  const handleUserCellEdit = useCallback(async (
    rowId: string,
    field: string,
    value: any
  ): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      const response = await fetch('/api/admin/users/update-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: rowId,
          field,
          value
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Error al actualizar' }
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === rowId ? { ...u, [field]: value } : u
        )
      )

      toast.success('Usuario actualizado')
      return { success: true, data: data.data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [])

  const handleImageUpload = useCallback(async (rowId: string, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('inmuebleId', rowId)

    try {
      const response = await fetch('/api/inmuebles/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || 'Error al subir imagen')
        return
      }

      setInmuebles((prev) =>
        prev.map((item) =>
          item.id === Number(rowId) ? result.data : item
        )
      )
      toast.success('Imagen subida exitosamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al subir imagen')
    }
  }, [])

  const inmueblesColumns = useMemo(
    () => getInmueblesColumns(handleImageUpload),
    [handleImageUpload]
  )

  const handleInmuebleCellEdit = useCallback(async (
    rowId: string,
    field: string,
    value: any
  ): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      const response = await fetch('/api/inmuebles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(rowId), field, value }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setInmuebles((prev) =>
        prev.map((item) =>
          item.id === Number(rowId) ? result.data : item
        )
      )

      return { success: true, data: result.data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [])

  const handleAddInmueble = useCallback(async (
    newRecord: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> => {
    setAddRecordState('saving')
    try {
      const response = await fetch('/api/inmuebles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      })

      const result = await response.json()

      if (!result.success) {
        setAddRecordState('idle')
        return { success: false, error: result.error }
      }

      setInmuebles((prev) => [result.data, ...prev])
      setAddRecordState('idle')
      toast.success('Inmueble creado exitosamente')
      return { success: true }
    } catch (error: any) {
      setAddRecordState('idle')
      return { success: false, error: error.message }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleRefresh = () => {
    if (activeTab === 'usuarios') {
      loadUsers()
    } else {
      loadInmuebles()
    }
  }

  const getTabStats = () => {
    if (activeTab === 'usuarios') {
      return `${users.length} usuarios registrados`
    }
    return `${inmuebles.length} inmuebles`
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0D0] mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const loading = activeTab === 'usuarios' ? usersLoading : inmueblesLoading

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0D0] to-[#00dbbe] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#0B1B32]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Administración
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Aloba Marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </button>

            {activeTab === 'inmuebles' && (
              <button
                onClick={() => setAddRecordState('adding')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0B1B32] bg-[#00F0D0] rounded-lg hover:bg-[#00dbbe] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo Inmueble
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#00F0D0] text-[#00F0D0]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2">
        <div className="max-w-[1800px] mx-auto">
          <p className="text-sm font-medium text-[#00F0D0]">
            {getTabStats()}
          </p>
        </div>
      </div>

      <main className="flex-1 p-4">
        <div className="max-w-[1800px] mx-auto h-[calc(100vh-200px)]">
          {activeTab === 'usuarios' ? (
            <CustomTable
              data={users}
              columnsDef={usersColumns}
              pageSize={50}
              loading={usersLoading}
              showFiltersToolbar={true}
              onRefresh={loadUsers}
              onCellEdit={handleUserCellEdit}
              containerHeight="100%"
              rowHeight={50}
              loadingText="Cargando usuarios..."
              noResultsText="No hay usuarios registrados"
            />
          ) : (
            <CustomTable
              data={inmuebles}
              columnsDef={inmueblesColumns}
              pageSize={50}
              loading={inmueblesLoading}
              showFiltersToolbar={true}
              onRefresh={loadInmuebles}
              onCellEdit={handleInmuebleCellEdit}
              onAddRecord={handleAddInmueble}
              addRecordState={addRecordState}
              containerHeight="100%"
              rowHeight={50}
              loadingText="Cargando inmuebles..."
              noResultsText="No hay inmuebles registrados"
            />
          )}
        </div>
      </main>
    </div>
  )
}
