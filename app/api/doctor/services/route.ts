import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'

interface DoctorService {
  id: number
  doctor_id: number
  title: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const doctorId = searchParams.get("doctorId")

    if (doctorId) {
      const services = await query<DoctorService>(
        `SELECT id, doctor_id, title, description, sort_order, is_active, created_at, updated_at
         FROM doctor_services
         WHERE doctor_id = ? AND is_active = TRUE
         ORDER BY sort_order ASC, id ASC`,
        [doctorId]
      )
      return NextResponse.json({ success: true, data: services })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "doctor" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const targetDoctorId = searchParams.get("targetDoctorId")
    const queryDoctorId = session.role === "admin" && targetDoctorId ? targetDoctorId : session.id

    const services = await query<DoctorService>(
      `SELECT id, doctor_id, title, description, sort_order, is_active, created_at, updated_at
       FROM doctor_services
       WHERE doctor_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [queryDoctorId]
    )

    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    console.error("[API doctor/services GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error al obtener servicios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "doctor" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, targetDoctorId } = body

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: "El título es requerido" }, { status: 400 })
    }

    const doctorId = session.role === "admin" && targetDoctorId ? targetDoctorId : session.id

    const maxOrderResult = await query<{ max_order: number | null }>(
      "SELECT MAX(sort_order) as max_order FROM doctor_services WHERE doctor_id = ?",
      [doctorId]
    )
    const nextOrder = (maxOrderResult[0]?.max_order || 0) + 1

    await query(
      `INSERT INTO doctor_services (doctor_id, title, description, sort_order)
       VALUES (?, ?, ?, ?)`,
      [doctorId, title.trim(), description?.trim() || null, nextOrder]
    )

    const services = await query<DoctorService>(
      `SELECT id, doctor_id, title, description, sort_order, is_active, created_at, updated_at
       FROM doctor_services
       WHERE doctor_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [doctorId]
    )

    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    console.error("[API doctor/services POST] Error:", error)
    return NextResponse.json({ success: false, error: "Error al crear servicio" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "doctor" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, description, is_active, targetDoctorId } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 })
    }

    const doctorId = session.role === "admin" && targetDoctorId ? targetDoctorId : session.id

    const existing = await query<DoctorService>(
      "SELECT * FROM doctor_services WHERE id = ? AND doctor_id = ?",
      [id, doctorId]
    )

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Servicio no encontrado" }, { status: 404 })
    }

    await query(
      `UPDATE doctor_services SET title = ?, description = ?, is_active = ? WHERE id = ?`,
      [title?.trim() || existing[0].title, description?.trim() || null, is_active ?? existing[0].is_active, id]
    )

    const services = await query<DoctorService>(
      `SELECT id, doctor_id, title, description, sort_order, is_active, created_at, updated_at
       FROM doctor_services
       WHERE doctor_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [doctorId]
    )

    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    console.error("[API doctor/services PUT] Error:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar servicio" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "doctor" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const id = searchParams.get("id")
    const targetDoctorId = searchParams.get("targetDoctorId")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 })
    }

    const doctorId = session.role === "admin" && targetDoctorId ? targetDoctorId : session.id

    const existing = await query<DoctorService>(
      "SELECT * FROM doctor_services WHERE id = ? AND doctor_id = ?",
      [id, doctorId]
    )

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Servicio no encontrado" }, { status: 404 })
    }

    await query("DELETE FROM doctor_services WHERE id = ?", [id])

    const services = await query<DoctorService>(
      `SELECT id, doctor_id, title, description, sort_order, is_active, created_at, updated_at
       FROM doctor_services
       WHERE doctor_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [doctorId]
    )

    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    console.error("[API doctor/services DELETE] Error:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar servicio" }, { status: 500 })
  }
}
