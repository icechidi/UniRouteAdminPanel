import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get("scheduleId")

    const sql = getSql()
    let busTimes

    if (scheduleId) {
      busTimes = await sql`
        SELECT bt.*, rs.stop_name, r.route_name, b.bus_number
        FROM bus_times bt
        JOIN route_stops rs ON bt.route_stop_id = rs.route_stop_id
        JOIN schedules s ON bt.schedule_id = s.schedule_id
        JOIN routes r ON s.route_id = r.route_id
        JOIN buses b ON s.bus_id = b.bus_id
        WHERE bt.schedule_id = ${Number.parseInt(scheduleId)}
        ORDER BY bt.scheduled_departure_time
      `
    } else {
      busTimes = await sql`
        SELECT bt.*, rs.stop_name, r.route_name, b.bus_number
        FROM bus_times bt
        JOIN route_stops rs ON bt.route_stop_id = rs.route_stop_id
        JOIN schedules s ON bt.schedule_id = s.schedule_id
        JOIN routes r ON s.route_id = r.route_id
        JOIN buses b ON s.bus_id = b.bus_id
        ORDER BY bt.created_at DESC
      `
    }

    return NextResponse.json(busTimes)
  } catch (error) {
    console.error("Failed to fetch bus times:", error)
    return NextResponse.json({ error: "Failed to fetch bus times" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { schedule_id, route_stop_id, scheduled_departure_time, scheduled_arrival_time } = body

    const sql = getSql()
    const result = await sql`
      INSERT INTO bus_times (schedule_id, route_stop_id, scheduled_departure_time, scheduled_arrival_time)
      VALUES (${schedule_id}, ${route_stop_id}, ${scheduled_departure_time}, ${scheduled_arrival_time})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create bus time:", error)
    return NextResponse.json({ error: "Failed to create bus time" }, { status: 500 })
  }
}
