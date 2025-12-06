import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"

interface Review {
  id: number
  doctor_id: number
  reviewer_id: number
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  is_visible: boolean
  helpful_count: number
  reviewer_name: string
  reviewer_picture: string | null
  reviewer_role: string
}

interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")
    const doctorUsername = searchParams.get("username")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const offset = (page - 1) * limit

    if (!doctorId && !doctorUsername) {
      return NextResponse.json(
        { success: false, error: "Se requiere doctorId o username" },
        { status: 400 }
      )
    }

    let targetDoctorId = doctorId

    if (doctorUsername && !doctorId) {
      const doctorRows = await query<{ id: number }>(
        "SELECT id FROM users WHERE usuario = ? AND role = 'doctor' LIMIT 1",
        [doctorUsername]
      )
      if (doctorRows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Doctor no encontrado" },
          { status: 404 }
        )
      }
      targetDoctorId = String(doctorRows[0].id)
    }

    const reviews = await query<Review>(
      `SELECT
        r.id,
        r.doctor_id,
        r.reviewer_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        r.is_visible,
        r.helpful_count,
        COALESCE(u.full_name, CONCAT(u.first_name, ' ', u.last_name), 'Usuario') as reviewer_name,
        u.picture as reviewer_picture,
        u.role as reviewer_role
      FROM doctor_reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.doctor_id = ? AND r.is_visible = TRUE
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [targetDoctorId, limit, offset]
    )

    const statsRows = await query<{
      total_reviews: number
      average_rating: number
      r1: number
      r2: number
      r3: number
      r4: number
      r5: number
    }>(
      `SELECT
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as r1,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as r2,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as r3,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as r4,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as r5
      FROM doctor_reviews
      WHERE doctor_id = ? AND is_visible = TRUE`,
      [targetDoctorId]
    )

    const stats: ReviewStats = {
      total_reviews: statsRows[0]?.total_reviews || 0,
      average_rating: Number(statsRows[0]?.average_rating || 0),
      rating_distribution: {
        1: statsRows[0]?.r1 || 0,
        2: statsRows[0]?.r2 || 0,
        3: statsRows[0]?.r3 || 0,
        4: statsRows[0]?.r4 || 0,
        5: statsRows[0]?.r5 || 0,
      },
    }

    const session = await getSession()

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats,
        currentUserId: session?.id || null,
        pagination: {
          page,
          limit,
          total: stats.total_reviews,
          totalPages: Math.ceil(stats.total_reviews / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener reseñas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para dejar una reseña" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { doctorId, rating, comment } = body

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: "Se requiere el ID del doctor" },
        { status: 400 }
      )
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "La calificación debe ser entre 1 y 5" },
        { status: 400 }
      )
    }

    if (session.id === doctorId) {
      return NextResponse.json(
        { success: false, error: "No puedes calificarte a ti mismo" },
        { status: 400 }
      )
    }

    const doctorExists = await query<{ id: number }>(
      "SELECT id FROM users WHERE id = ? AND role = 'doctor' AND estado = 'confirmado' LIMIT 1",
      [doctorId]
    )

    if (doctorExists.length === 0) {
      return NextResponse.json(
        { success: false, error: "Doctor no encontrado" },
        { status: 404 }
      )
    }

    await query(
      `INSERT INTO doctor_reviews (doctor_id, reviewer_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [doctorId, session.id, rating, comment?.trim() || null]
    )

    return NextResponse.json({
      success: true,
      message: "Reseña publicada exitosamente",
    })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { success: false, error: "Error al publicar reseña" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get("reviewId")

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Se requiere el ID de la reseña" },
        { status: 400 }
      )
    }

    const review = await query<{ id: number; reviewer_id: number }>(
      "SELECT id, reviewer_id FROM doctor_reviews WHERE id = ? LIMIT 1",
      [reviewId]
    )

    if (review.length === 0) {
      return NextResponse.json(
        { success: false, error: "Reseña no encontrada" },
        { status: 404 }
      )
    }

    if (review[0].reviewer_id !== session.id && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para eliminar esta reseña" },
        { status: 403 }
      )
    }

    await query("DELETE FROM doctor_reviews WHERE id = ?", [reviewId])

    return NextResponse.json({
      success: true,
      message: "Reseña eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { success: false, error: "Error al eliminar reseña" },
      { status: 500 }
    )
  }
}
