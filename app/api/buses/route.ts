import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const buses = await sql`
      SELECT b.*, d.name as driver_name 
      FROM buses b 
      LEFT JOIN drivers d ON b.driver_id = d.id 
      ORDER BY b.created_at DESC
    `
    return NextResponse.json(buses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch buses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { bus_number, capacity, model, year, status } = body

    const sql = getSql()
    const result = await sql`
      INSERT INTO buses (bus_number, capacity, model, year, status)
      VALUES (${bus_number}, ${capacity}, ${model}, ${year}, ${status})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create bus" }, { status: 500 })
  }
}
