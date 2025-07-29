import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const schedules = await sql`
      SELECT s.*, 
             r.title as route_title,
             b.bus_number,
             d.name as driver_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      JOIN drivers d ON s.driver_id = d.id
      ORDER BY s.created_at DESC
    `
    return NextResponse.json(schedules)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { route_id, bus_id, driver_id, departure_time, arrival_time, days_of_week, status } = body

    const sql = getSql()
    const result = await sql`
      INSERT INTO schedules (route_id, bus_id, driver_id, departure_time, arrival_time, days_of_week, status)
      VALUES (${route_id}, ${bus_id}, ${driver_id}, ${departure_time}, ${arrival_time}, ${days_of_week}, ${status})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}
