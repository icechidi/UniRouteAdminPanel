import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Set demo mode environment variable (this would be handled differently in production)
    process.env.DEMO_MODE = "true"

    return NextResponse.json({
      success: true,
      message: "Demo mode activated successfully",
    })
  } catch (error) {
    console.error("Demo mode activation failed:", error)
    return NextResponse.json({ message: "Failed to activate demo mode" }, { status: 500 })
  }
}
