import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const drivers = await sql`
      SELECT * FROM drivers ORDER BY created_at DESC
    `
    return NextResponse.json(drivers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { name, email, phone, license_number, experience_years, status } = body

    const sql = getSql()
    const result = await sql`
      INSERT INTO drivers (name, email, phone, license_number, experience_years, status)
      VALUES (${name}, ${email}, ${phone}, ${license_number}, ${experience_years}, ${status})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 })
  }
}
