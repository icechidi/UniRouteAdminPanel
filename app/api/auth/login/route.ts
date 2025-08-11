export const runtime = "nodejs";
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
    const usersResult = await sql.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.password_hash, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1`,
      [email]
    )
    const users = usersResult.rows

    if (users.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    if (!user.password_hash) {
      // User has no password set, deny login
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }
    const isValidPassword = await verifyPassword(password, user.password_hash)
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
