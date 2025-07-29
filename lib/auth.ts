import { getSql, isDatabaseConfigured, isDemoMode } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  name: string
  email: string
  role: string
  phone?: string
}

// Demo user for offline mode
const DEMO_USER: User = {
  id: 1,
  name: "Demo Admin",
  email: "admin@uniroute.edu",
  role: "admin",
  phone: "+1234567890",
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  if (isDemoMode()) {
    // In demo mode, just set a cookie without database
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const cookieStore = await cookies()
    cookieStore.set("demo_session", sessionToken, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return sessionToken
  }

  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured")
  }

  const sql = getSql()
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt})
  `

  const cookieStore = await cookies()
  cookieStore.set("session", sessionToken, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  return sessionToken
}

export async function getSession(): Promise<User | null> {
  try {
    // Check for demo session first
    const cookieStore = await cookies()
    const demoSession = cookieStore.get("demo_session")?.value

    if (demoSession) {
      return DEMO_USER
    }

    if (isDemoMode()) {
      return null
    }

    if (!isDatabaseConfigured()) {
      return null
    }

    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    const sql = getSql()
    const sessions = await sql`
      SELECT u.id, u.name, u.email, u.role, u.phone
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    return sessions[0] as User
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export async function logout() {
  try {
    const cookieStore = await cookies()

    if (isDemoMode()) {
      cookieStore.delete("demo_session")
      redirect("/login")
      return
    }

    if (!isDatabaseConfigured()) {
      cookieStore.delete("session")
      redirect("/setup")
      return
    }

    const sessionToken = cookieStore.get("session")?.value

    if (sessionToken) {
      const sql = getSql()
      await sql`DELETE FROM sessions WHERE session_token = ${sessionToken}`
    }

    cookieStore.delete("session")
  } catch (error) {
    console.error("Logout error:", error)
  }
  redirect("/login")
}
