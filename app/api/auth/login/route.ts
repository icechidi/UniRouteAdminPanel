import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ message: "Database not configured" }, { status: 503 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const db = getSql()

    const result = await db.query(
      `SELECT id, name, email, role, password_hash FROM users WHERE email = $1 LIMIT 1`,
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const user = result.rows[0]
    let isValidPassword = false

    if (user.password_hash) {
      isValidPassword = await verifyPassword(password, user.password_hash)
    } else {
      // For demo fallback
      isValidPassword = password === "password"

      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.query(
          `UPDATE users SET password_hash = $1 WHERE id = $2`,
          [hashedPassword, user.id]
        )
      }
    }

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    await createSession(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
