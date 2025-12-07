/**
 * FILE: lib/auth.ts
 * Aloba - Authentication library
 */

import { cookies } from "next/headers"
import { getConnection } from "./db"
import crypto from "crypto"

export interface User {
  id: number
  email: string
  google_id: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  picture: string | null
  locale: string | null
  jwd: string | null
  role: string | null
  estado: string | null
  created_at: Date
  updated_at: Date
  last_login: Date | null
  telefono: string | null
}

const TOKEN_BYTES = Number(process.env.AUTH_JWD_BYTES) || 64
const COOKIE_NAME = "alobaAuth"
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost"

const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret"

export function genJwd(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex")
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getConnection()
    const [rows] = await db.query(
      `SELECT id, email, google_id, first_name, last_name, full_name, picture, locale, jwd, role, estado, created_at, updated_at, last_login, telefono
       FROM users
       WHERE email = ?`,
      [email.toLowerCase()],
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return null
    }

    return rows[0] as User
  } catch (error) {
    console.error("[auth] Error finding user by email:", error)
    return null
  }
}

export async function findUserByJwd(jwd: string): Promise<User | null> {
  try {
    const db = await getConnection()
    const [rows] = await db.query(
      `SELECT id, email, google_id, first_name, last_name, full_name, picture, locale, jwd, role, estado, created_at, updated_at, last_login, telefono
       FROM users
       WHERE jwd = ?`,
      [jwd],
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return null
    }

    return rows[0] as User
  } catch (error) {
    console.error("[auth] Error finding user by jwd:", error)
    return null
  }
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  try {
    // Authentication with email/password is disabled - only Google OAuth
    return null
  } catch (error) {
    console.error("[auth] Error authenticating user:", error)
    return null
  }
}

export async function createUser(data: {
  email: string
  googleId: string
  firstName: string
  lastName: string
  fullName: string
  picture: string
  locale: string
}): Promise<number> {
  try {
    const db = await getConnection()
    const newJwd = genJwd()

    const [result] = await db.query(
      `INSERT INTO users
       (email, google_id, first_name, last_name, full_name, picture, locale, jwd)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.email.toLowerCase(), data.googleId, data.firstName, data.lastName, data.fullName, data.picture, data.locale, newJwd],
    )

    return result.insertId
  } catch (error) {
    console.error("[auth] Error creating user:", error)
    throw error
  }
}

export async function updateUserJwd(userId: number, jwd: string): Promise<void> {
  try {
    const db = await getConnection()
    await db.query("UPDATE users SET jwd = ? WHERE id = ?", [jwd, userId])
  } catch (error) {
    console.error("[auth] Error updating user jwd:", error)
    throw error
  }
}

export function getCookieName(): string {
  return COOKIE_NAME
}

export function getCookieDomain(): string {
  return COOKIE_DOMAIN
}

/**
 * Limpia las cookies de sesión de manera robusta
 * Retorna headers para borrar la cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: COOKIE_DOMAIN,
    maxAge: 0,
    expires: new Date(0),
  })
}

export async function createSession(user: User) {
  const jwd = genJwd()
  await updateUserJwd(user.id, jwd)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, jwd, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: COOKIE_DOMAIN,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const jwd = cookieStore.get(COOKIE_NAME)?.value

    if (!jwd) {
      return null
    }

    const user = await findUserByJwd(jwd)

    if (!user) {
      await clearSessionCookie()
      return null
    }

    return user
  } catch (error) {
    console.error("[auth] Error getting session:", error)
    await clearSessionCookie()
    return null
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies()
    const jwd = cookieStore.get(COOKIE_NAME)?.value

    if (jwd) {
      const user = await findUserByJwd(jwd)
      if (user?.id) {
        const db = await getConnection()
        // Set jwd to empty string instead of null to avoid SQL issues
        await db.query("UPDATE users SET jwd = '' WHERE id = ?", [user.id])
      }
    }
  } catch (error) {
    console.error("[auth] Error destroying session:", error)
  } finally {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: COOKIE_DOMAIN,
      maxAge: 0,
      expires: new Date(0),
    })
  }
}

export async function verifyAuth(request: Request): Promise<{ user: User | null; error?: string }> {
  const cookieStore = await cookies()
  const jwd = cookieStore.get(COOKIE_NAME)?.value
  if (!jwd) {
    return { user: null, error: "No token provided" }
  }
  try {
    const user = await findUserByJwd(jwd)
    if (!user) {
      console.log("[auth] Token verification failed: user not found in database")
      await clearSessionCookie()
      return { user: null, error: "Invalid session token" }
    }
    return { user }
  } catch (err) {
    console.error("[auth] Error during token verification:", err)
    await clearSessionCookie()
    return { user: null, error: "Invalid session" }
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  try {
    const db = await getConnection()
    const [rows] = await db.query(
      `SELECT id, email, google_id, first_name, last_name, full_name, picture, locale, jwd, role, estado, created_at, updated_at, last_login, telefono
       FROM users WHERE id = ?`,
      [userId],
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return null
    }

    return rows[0] as User
  } catch (error) {
    console.error("[auth] Error obteniendo usuario por ID:", error)
    return null
  }
}
