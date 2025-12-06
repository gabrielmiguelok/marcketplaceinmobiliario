import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

interface PatientProfile {
  id: number
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  picture: string | null
  telefono: string | null
  direccion: string | null
  fecha_nacimiento: string | null
  sexo: string | null
  tipo_sangre: string | null
  alergias: string | null
  antecedentes_familiares: string | null
  antecedentes_personales: string | null
  medicamentos_actuales: string | null
  peso: number | null
  altura: number | null
  contacto_emergencia: string | null
  telefono_emergencia: string | null
  role: string
  estado: string
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "paciente" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 })
    }

    const users = await query<PatientProfile>(
      `SELECT id, email, full_name, first_name, last_name, picture, telefono,
              direccion_consultorio as direccion, fecha_nacimiento, sexo,
              tipo_sangre, alergias, antecedentes_familiares, antecedentes_personales,
              medicamentos_actuales, peso, altura, contacto_emergencia, telefono_emergencia,
              role, estado
       FROM users WHERE id = ?`,
      [session.id]
    )

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: users[0],
    })
  } catch (error) {
    console.error("[API paciente/update-profile GET] Error:", error)
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    if (session.role !== "paciente" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const {
      full_name,
      first_name,
      last_name,
      telefono,
      direccion,
      fecha_nacimiento,
      sexo,
      tipo_sangre,
      alergias,
      antecedentes_familiares,
      antecedentes_personales,
      medicamentos_actuales,
      peso,
      altura,
      contacto_emergencia,
      telefono_emergencia,
    } = body

    await query(
      `UPDATE users SET
        full_name = ?,
        first_name = ?,
        last_name = ?,
        telefono = ?,
        direccion_consultorio = ?,
        fecha_nacimiento = ?,
        sexo = ?,
        tipo_sangre = ?,
        alergias = ?,
        antecedentes_familiares = ?,
        antecedentes_personales = ?,
        medicamentos_actuales = ?,
        peso = ?,
        altura = ?,
        contacto_emergencia = ?,
        telefono_emergencia = ?
       WHERE id = ?`,
      [
        full_name || null,
        first_name || null,
        last_name || null,
        telefono || null,
        direccion || null,
        fecha_nacimiento || null,
        sexo || null,
        tipo_sangre || null,
        alergias || null,
        antecedentes_familiares || null,
        antecedentes_personales || null,
        medicamentos_actuales || null,
        peso ? parseFloat(peso) : null,
        altura ? parseFloat(altura) : null,
        contacto_emergencia || null,
        telefono_emergencia || null,
        session.id
      ]
    )

    // Sincronizar con tabla patients donde este usuario esté vinculado
    const syncFields = {
      fecha_nacimiento: fecha_nacimiento || null,
      telefono: telefono || null,
      tipo_sangre: tipo_sangre || null,
      alergias: alergias || null,
      antecedentes_familiares: antecedentes_familiares || null,
      antecedentes_personales: antecedentes_personales || null,
      medicamentos_actuales: medicamentos_actuales || null,
      sexo: sexo || null,
    }

    // Actualizar nombre completo en patients
    const nombreCompleto = full_name || `${first_name || ""} ${last_name || ""}`.trim() || null

    await query(
      `UPDATE patients SET
        nombre_completo = COALESCE(?, nombre_completo),
        fecha_nacimiento = ?,
        telefono = COALESCE(?, telefono),
        tipo_sangre = COALESCE(?, tipo_sangre),
        alergias = ?,
        antecedentes_familiares = ?,
        antecedentes_personales = ?,
        medicamentos_actuales = ?,
        sexo = COALESCE(?, sexo)
       WHERE user_id = ?`,
      [
        nombreCompleto,
        syncFields.fecha_nacimiento,
        syncFields.telefono,
        syncFields.tipo_sangre,
        syncFields.alergias,
        syncFields.antecedentes_familiares,
        syncFields.antecedentes_personales,
        syncFields.medicamentos_actuales,
        syncFields.sexo,
        session.id
      ]
    )

    const updatedUser = await query<PatientProfile>(
      `SELECT id, email, full_name, first_name, last_name, picture, telefono,
              direccion_consultorio as direccion, fecha_nacimiento, sexo,
              tipo_sangre, alergias, antecedentes_familiares, antecedentes_personales,
              medicamentos_actuales, peso, altura, contacto_emergencia, telefono_emergencia,
              role, estado
       FROM users WHERE id = ?`,
      [session.id]
    )

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: updatedUser[0],
    })
  } catch (error) {
    console.error("[API paciente/update-profile POST] Error:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar perfil" }, { status: 500 })
  }
}
