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
      SELECT id, name, email, role, password_hash
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Check if password_hash exists, if not, use a simple comparison for demo
    let isValidPassword = false

    if (user.password_hash) {
      // Use bcrypt verification if hash exists
      isValidPassword = await verifyPassword(password, user.password_hash)
    } else {
      // For demo purposes, allow "password" as the password if no hash exists
      isValidPassword = password === "password"

      // Optionally, hash and store the password for future use
      if (isValidPassword) {
        const bcrypt = require("bcryptjs")
        const hashedPassword = await bcrypt.hash(password, 10)
        await sql`
          UPDATE users 
          SET password_hash = ${hashedPassword} 
          WHERE id = ${user.id}
        `
      }
    }

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Create session
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
