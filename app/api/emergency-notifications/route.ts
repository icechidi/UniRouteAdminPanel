import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const notifications = await sql`
      SELECT en.*, r.route_name, b.bus_number, u.first_name || ' ' || u.last_name as driver_name, m.message_text
      FROM emergency_notifications en
      LEFT JOIN routes r ON en.route_id = r.route_id
      LEFT JOIN buses b ON en.bus_id = b.bus_id
      LEFT JOIN users u ON en.user_id = u.user_id
      LEFT JOIN messages m ON en.message_id = m.message_id
      ORDER BY en.triggered_at DESC
    `
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Failed to fetch emergency notifications:", error)
    return NextResponse.json({ error: "Failed to fetch emergency notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { route_id, bus_id, user_id, message_id, location_longitude, location_latitude } = body

    const sql = getSql()
    const result = await sql`
      INSERT INTO emergency_notifications (route_id, bus_id, user_id, message_id, location_longitude, location_latitude)
      VALUES (${route_id}, ${bus_id}, ${user_id}, ${message_id}, ${location_longitude}, ${location_latitude})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create emergency notification:", error)
    return NextResponse.json({ error: "Failed to create emergency notification" }, { status: 500 })
  }
}
