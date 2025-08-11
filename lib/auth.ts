import { getSql, isDatabaseConfigured, isDemoMode, getUserActivityLogs } from "@/lib/db"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

export interface User {
  user_id: number
  first_name: string
  last_name: string
  username?: string
  email: string
  role_id: number
  role_name: string // Added for convenience
  phone?: string
  country?: string
  photo_url?: string
  language_pref?: string
  unique_id?: string
}

// Demo user for offline mode
const DEMO_USER: User = {
  user_id: 1,
  role_id: 1,
  first_name: "Demo",
  last_name: "Admin",
  username: "demoadmin",
  email: "admin@uniroute.edu",
  role_name: "admin",
  phone: "+1234567890",
  country: "USA",
  photo_url: "/placeholder.svg?height=32&width=32",
  language_pref: "en",
  unique_id: "demo-uuid-12345",
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const cookieStore = cookies()

  if (isDemoMode()) {
    cookieStore.set("demo_session", sessionToken, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  } else {
    if (!isDatabaseConfigured()) {
      throw new Error("Database not configured")
    }

    const sql = getSql()
    await sql.query(
      "INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)",
      [userId, sessionToken, expiresAt]
    )

    cookieStore.set("session", sessionToken, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  }

  // Log login activity
  await logUserActivity(userId, "login", { message: "User logged in" })

  return sessionToken
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const demoSession = cookieStore.get("demo_session")?.value

    if (demoSession) {
      return DEMO_USER
    }

    if (isDemoMode() || !isDatabaseConfigured()) {
      return null
    }

    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    const sql = getSql()
    const result = await sql.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.phone, u.country, u.photo_url, u.language_pref, u.unique_id, r.role_id, r.name as role_name
      FROM sessions s
      JOIN users u ON s.user_id = u.user_id
      JOIN roles r ON u.role_id = r.role_id
      WHERE s.session_token = $1 AND s.expires_at > NOW()`,
      [sessionToken]
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as User
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
  if (!allowedRoles.includes(user.role_name)) {
    redirect("/unauthorized")
  }
  return user
}

export async function logout() {
  try {
    const cookieStore = cookies()
    const user = await getSession() // Get user before clearing session

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
      await sql.query("DELETE FROM sessions WHERE session_token = $1", [sessionToken])
    }

    cookieStore.delete("session")

    // Log logout activity
    if (user) {
      await logUserActivity(user.user_id, "logout", { message: "User logged out" })
    }
  } catch (error) {
    console.error("Logout error:", error)
  }
  redirect("/login")
}

export async function logUserActivity(
  userId: number | null,
  activityType: string,
  details: Record<string, any> = {},
) {
  if (isDemoMode() || !isDatabaseConfigured() || userId === null) {
    console.log(`DEMO/UNCONFIGURED DB: Logged activity for user ${userId}: ${activityType}`, details)
    return
  }

  try {
    const sql = getSql()
    // Check if user exists before logging activity
    const userCheck = await sql.query("SELECT user_id FROM users WHERE user_id = $1", [userId])
    if (!userCheck.rows.length) {
      console.warn(`User ${userId} does not exist, skipping activity log.`)
      return
    }
    const ipAddress = headers().get("x-forwarded-for") || headers().get("x-real-ip") || "unknown"
    const userAgent = headers().get("user-agent") || "unknown"

    await sql.query(
      "INSERT INTO user_activity_logs (user_id, activity_type, details, ip_address, user_agent) VALUES ($1, $2, $3::jsonb, $4, $5)",
      [userId, activityType, JSON.stringify(details), ipAddress, userAgent]
    )
  } catch (error) {
    console.error("Failed to log user activity:", error)
  }
}
