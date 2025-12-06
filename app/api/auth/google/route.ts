import { NextResponse, type NextRequest } from "next/server"
import { google } from "googleapis"
import crypto from "crypto"
import { getConnection } from "@/lib/db"

const TOKEN_BYTES = Number(process.env.AUTH_JWD_BYTES) || 64
const COOKIE_NAME = "doutopAuth"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://doctop.space"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BASE_URL}/api/auth/google`,
)

const genJwd = () => crypto.randomBytes(TOKEN_BYTES).toString("hex")

// Mejora la calidad de la imagen de perfil de Google (de 96px a 400px)
function getHighQualityGooglePicture(pictureUrl: string): string {
  if (!pictureUrl) return ""
  // Google picture URLs terminan en =s96-c (96px) por defecto
  // Cambiamos a =s400-c para obtener 400px de calidad
  return pictureUrl.replace(/=s\d+-c$/, "=s400-c")
}

function sanitizeRedirect(url = "/") {
  try {
    if (url.startsWith("/")) return url
    const u = new URL(url, BASE_URL)
    if (u.origin === BASE_URL) return u.pathname + u.search + u.hash
  } catch {}
  return "/"
}

// POST method disabled - only Google OAuth authentication is allowed
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Login with email/password is disabled. Please use Google OAuth." }, { status: 403 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const email = searchParams.get("email")
  const redirect = searchParams.get("redirect")
  const roleParam = searchParams.get("role")

  const requestedRedirect = redirect || "/"
  const redirectUrl = sanitizeRedirect(requestedRedirect)

  if (!code) {
    console.log("[google-auth] OAuth launcher, redirect:", redirectUrl, "role:", roleParam)
    const stateData = JSON.stringify({ redirect: redirectUrl, role: roleParam || null })
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"],
      prompt: "consent",
      state: stateData,
      login_hint: email || undefined,
    })
    return NextResponse.redirect(authUrl)
  }

  let parsedState = { redirect: "/", role: null as string | null }
  try {
    if (state) {
      parsedState = JSON.parse(state)
    }
  } catch {
    parsedState.redirect = state || "/"
  }
  const finalRedirect = sanitizeRedirect(parsedState.redirect)
  const registrationRole = parsedState.role

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauthUser = google.oauth2({ auth: oauth2Client, version: "v2" })
    const { data } = await oauthUser.userinfo.get()

    const {
      email: userEmail,
      given_name: firstName = "",
      family_name: lastName = "",
      name: fullName = "",
      picture: rawPicture = "",
      locale = "",
      id: googleId,
    } = data

    // Obtener imagen en alta calidad (400px en lugar de 96px)
    const picture = getHighQualityGooglePicture(rawPicture)

    if (!userEmail) {
      console.warn("[google-auth] Google did not send email")
      return NextResponse.redirect(`${BASE_URL}/?error=no_email`)
    }

    const newJwd = genJwd()

    let db
    try {
      db = await getConnection()
    } catch (dbError) {
      console.error("[google-auth] GET Database connection error:", dbError)
      return NextResponse.redirect(`${BASE_URL}/?error=db_error`)
    }

    let userId: number
    let isNew = false

    try {
      // Primero buscar si existe un usuario con este email
      const [existingUsers]: any = await db.query(
        `SELECT id, google_id FROM users WHERE email = ? LIMIT 1`,
        [userEmail]
      )

      if (existingUsers.length > 0) {
        // Usuario existe - actualizar con datos de Google OAuth
        userId = existingUsers[0].id
        await db.query(
          `UPDATE users SET
            jwd = ?,
            google_id = ?,
            first_name = ?,
            last_name = ?,
            full_name = ?,
            picture = ?,
            locale = ?,
            last_login = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [newJwd, googleId, firstName, lastName, fullName, picture, locale, userId]
        )
        console.log(`[google-auth] Usuario existente actualizado: ${userEmail} (ID: ${userId})`)
      } else {
        // Usuario nuevo - insertar con rol si se especificó
        const userRole = registrationRole && ['doctor', 'paciente'].includes(registrationRole) ? registrationRole : 'user'
        const [result]: any = await db.query(
          `INSERT INTO users
            (email, google_id, first_name, last_name, full_name, picture, locale, jwd, role, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
          [userEmail, googleId, firstName, lastName, fullName, picture, locale, newJwd, userRole]
        )
        userId = result.insertId
        isNew = true

        // Generar usuario automático único para TODOS los roles (email prefix + id)
        const emailPrefix = userEmail.split('@')[0]
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9.-]/g, "")
          .substring(0, 30)
        const autoUsername = `${emailPrefix}-${userId}`
        await db.query(
          `UPDATE users SET usuario = ? WHERE id = ?`,
          [autoUsername, userId]
        )
        console.log(`[google-auth] Usuario automático asignado: ${autoUsername}`)

        console.log(`[google-auth] Nuevo usuario creado: ${userEmail} (ID: ${userId}) con rol: ${userRole}`)
      }
    } catch (dbInsertError) {
      console.error("[google-auth] Database INSERT/UPDATE failed:", dbInsertError)
      console.error("[google-auth] Failed for user:", userEmail)
      console.error("[google-auth] Picture URL length:", picture?.length || 0)
      return NextResponse.redirect(`${BASE_URL}/?error=db_save_failed`)
    }

    const id = userId

    const eventType = isNew ? "REGISTRO" : "LOGIN"

    console.log(`[google-auth] ${eventType} for ${userEmail}`)
    console.log(`[google-auth] JWD generated and saved, length: ${newJwd.length}`)

    console.log(`[google-auth] Usuario ${isNew ? 'registrado' : 'logueado'}: ${userEmail}`)

    const response = NextResponse.redirect(new URL(finalRedirect, BASE_URL))
    response.cookies.set({
      name: COOKIE_NAME,
      value: newJwd,
      path: "/",
      httpOnly: true, // SEGURIDAD: Previene acceso desde JavaScript
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      domain: COOKIE_DOMAIN,
      maxAge: COOKIE_MAX_AGE,
    })

    return response
  } catch (err) {
    console.error("[google-auth] GET Error:", err)
    return NextResponse.redirect(`${BASE_URL}/?error=auth_failed`)
  }
}
