import { NextResponse } from "next/server"
import { createSession } from "@/lib/auth"

export async function POST() {
  try {
    // Enable demo mode
    process.env.DEMO_MODE = "true"

    // Create demo session (user ID 1 for demo admin)
    await createSession(1)

    return NextResponse.json({
      user: {
        id: 1,
        name: "Demo Admin",
        email: "admin@uniroute.edu",
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Demo login error:", error)
    return NextResponse.json({ message: "Demo login failed" }, { status: 500 })
  }
}
