import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

const ALLOWED_FIELDS = [
  "nombre_completo",
  "email",
  "telefono",
  "whatsapp",
  "fecha_nacimiento",
  "sexo",
  "tipo_sangre",
  "alergias",
  "antecedentes_familiares",
  "antecedentes_personales",
  "medicamentos_actuales",
  "notas_privadas",
  "estado",
]

const ENUM_VALUES: Record<string, string[]> = {
  sexo: ["masculino", "femenino", "otro", "no_especificado"],
  tipo_sangre: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "desconocido"],
  estado: ["activo", "inactivo", "archivado"],
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (!["doctor", "admin"].includes(session.role || "")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    if (session.estado !== "confirmado") {
      return NextResponse.json({ success: false, error: "Cuenta pendiente de aprobación" }, { status: 403 })
    }

    const body = await request.json()
    const { patientId, field, value } = body

    if (!patientId || !field) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      )
    }

    if (!ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo no permitido: ${field}` },
        { status: 400 }
      )
    }

    if (ENUM_VALUES[field] && value && !ENUM_VALUES[field].includes(value)) {
      return NextResponse.json(
        { success: false, error: `Valor no válido para ${field}` },
        { status: 400 }
      )
    }

    const patient = await query<{ id: number; doctor_id: number }>(
      `SELECT id, doctor_id FROM patients WHERE id = ?`,
      [patientId]
    )

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: "Paciente no encontrado" },
        { status: 404 }
      )
    }

    if (patient[0].doctor_id !== session.id && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para editar este paciente" },
        { status: 403 }
      )
    }

    let finalValue = value
    if (value === "" || value === null || value === undefined) {
      if (["nombre_completo"].includes(field)) {
        return NextResponse.json(
          { success: false, error: "El nombre no puede estar vacío" },
          { status: 400 }
        )
      }
      finalValue = null
    }

    await query(
      `UPDATE patients SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [finalValue, patientId]
    )

    return NextResponse.json({
      success: true,
      message: "Campo actualizado correctamente",
      data: {
        field,
        value: finalValue,
      },
    })
  } catch (error) {
    console.error("[API doctor/patients/update-field] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al actualizar el campo" },
      { status: 500 }
    )
  }
}
