import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ message: "Database not configured" }, { status: 503 })
    }

    const { email, password } = await request.json()
    const sql = getSql()

    // Find user by email
    const users = await sql`
      SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.password_hash, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    let isValidPassword = false

    if (user.password_hash) {
      isValidPassword = await verifyPassword(password, user.password_hash)
    } else {
      // For demo purposes, allow "password" as the password if no hash exists
      isValidPassword = password === "password"
    }

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    await createSession(user.user_id)

    return NextResponse.json({
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_name: user.role_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
