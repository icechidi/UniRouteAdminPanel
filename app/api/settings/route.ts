import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const settings = await sql`
      SELECT * FROM settings ORDER BY key
    `
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const sql = getSql()

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${value as string}, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET value = ${value as string}, updated_at = CURRENT_TIMESTAMP
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
