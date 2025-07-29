import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl || databaseUrl === "your_neon_database_url") {
      return NextResponse.json({ message: "Please provide a valid database URL" }, { status: 400 })
    }

    // Test the connection
    const sql = neon(databaseUrl)
    await sql`SELECT 1`

    return NextResponse.json({ success: true, message: "Connection successful" })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      { message: "Database connection failed. Please check your connection string." },
      { status: 500 },
    )
  }
}
