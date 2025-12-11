"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Building2, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import CustomTable from "@/components/CustomTable"
import { buildColumnsFromDefinition, ColumnFieldsDefinition } from "@/components/CustomTable/CustomTableColumnsConfig"

interface Inmueble {
  id: number | string
  titulo: string
  descripcion: string
  tipo: string
  operacion: string
  precio_usd: number
  precio_gtq: number
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
  _isNew?: boolean
}

const inmueblesFields: ColumnFieldsDefinition = {
  imagen_url: {
    type: 'image',
    header: '',
    width: 60,
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
  precio_usd: {
    type: 'currency',
    header: 'USD',
    width: 120,
  },
  precio_gtq: {
    type: 'currency',
    header: 'GTQ',
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
}

export default function AdminInmueblesPage() {
  const router = useRouter()
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [loading, setLoading] = useState(true)
  const [addRecordState, setAddRecordState] = useState<'idle' | 'adding' | 'saving' | 'confirmed'>('idle')
  const [newRecordData, setNewRecordData] = useState<Inmueble | null>(null)
  const [isAddingRecord, setIsAddingRecord] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inmuebles')
      if (!response.ok) throw new Error('Error al cargar inmuebles')
      const data = await response.json()
      setInmuebles(data.inmuebles || [])
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleImageUpload = useCallback(async (rowId: string, file: File) => {
    if (rowId.startsWith('temp_')) {
      toast.error('Guarda el registro primero antes de subir una imagen')
      return
    }

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

  const columns = useMemo(
    () => buildColumnsFromDefinition(inmueblesFields, handleImageUpload),
    [handleImageUpload]
  )

  const createEmptyInmueble = (): Inmueble => {
    const tempId = `temp_${Date.now()}`
    return {
      id: tempId,
      titulo: '',
      descripcion: '',
      tipo: 'apartamento',
      operacion: 'venta',
      precio_usd: 0,
      precio_gtq: 0,
      moneda: 'USD',
      ubicacion: '',
      zona: '',
      departamento: 'Guatemala',
      metros_cuadrados: 0,
      habitaciones: 0,
      banos: 0,
      parqueos: 0,
      imagen_url: null,
      destacado: false,
      estado: 'disponible',
      latitud: null,
      longitud: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _isNew: true,
    }
  }

  const handleCellEdit = useCallback(async (
    rowId: string,
    field: string,
    value: any
  ): Promise<{ success: boolean; error?: string; data?: any }> => {
    if (rowId.startsWith('temp_')) {
      setNewRecordData((prev) => {
        if (!prev) return prev
        return { ...prev, [field]: value }
      })

      setInmuebles((prev) =>
        prev.map((item) =>
          item.id === rowId ? { ...item, [field]: value } : item
        )
      )

      return { success: true }
    }

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

  const handleAddRecord = useCallback(async () => {
    if (addRecordState === 'idle') {
      setAddRecordState('adding')
      setIsAddingRecord(true)

      const tempRecord = createEmptyInmueble()
      setNewRecordData(tempRecord)
      setInmuebles((prev) => [tempRecord, ...prev])

    } else if (addRecordState === 'adding') {
      if (!newRecordData) {
        toast.error('No hay datos para guardar')
        return
      }

      if (!newRecordData.titulo || newRecordData.titulo.trim() === '') {
        toast.error('El título es obligatorio')
        return
      }

      setAddRecordState('saving')

      try {
        const { id, _isNew, created_at, updated_at, ...dataToSend } = newRecordData

        const response = await fetch('/api/inmuebles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        })

        const result = await response.json()

        if (!result.success) {
          toast.error(result.error || 'Error al crear inmueble')
          setAddRecordState('adding')
          return
        }

        setAddRecordState('confirmed')

        setInmuebles((prev) =>
          prev.map((item) =>
            item.id === newRecordData.id ? result.data : item
          )
        )

        toast.success('Inmueble creado exitosamente')

        setTimeout(() => {
          setAddRecordState('idle')
          setIsAddingRecord(false)
          setNewRecordData(null)
        }, 1000)

      } catch (error: any) {
        toast.error(error.message || 'Error al crear inmueble')
        setAddRecordState('adding')
      }
    }
  }, [addRecordState, newRecordData])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

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
                Gestión de Inmuebles
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {inmuebles.length} inmuebles · Aloba Marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

      <main className="flex-1 p-4">
        <div className="max-w-[1800px] mx-auto h-[calc(100vh-120px)]">
          <CustomTable
            data={inmuebles}
            columnsDef={columns}
            pageSize={50}
            loading={loading}
            showFiltersToolbar={true}
            onRefresh={loadData}
            onCellEdit={handleCellEdit}
            onAddRecord={handleAddRecord}
            addRecordState={addRecordState}
            containerHeight="100%"
            rowHeight={50}
            loadingText="Cargando inmuebles..."
            noResultsText="No hay inmuebles registrados"
          />
        </div>
      </main>
    </div>
  )
}
