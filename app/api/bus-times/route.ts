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
      const selectQuery = `
        SELECT bt.*, rs.stop_name, r.route_name, b.bus_number
        FROM bus_times bt
        JOIN route_stops rs ON bt.route_stop_id = rs.route_stop_id
        JOIN schedules s ON bt.schedule_id = s.schedule_id
        JOIN routes r ON s.route_id = r.route_id
        JOIN buses b ON s.bus_id = b.bus_id
        WHERE bt.schedule_id = $1
        ORDER BY bt.scheduled_departure_time
      `;
      const result = await sql.query(selectQuery, [Number.parseInt(scheduleId)]);
      busTimes = result.rows;
    } else {
      const selectQuery = `
        SELECT bt.*, rs.stop_name, r.route_name, b.bus_number
        FROM bus_times bt
        JOIN route_stops rs ON bt.route_stop_id = rs.route_stop_id
        JOIN schedules s ON bt.schedule_id = s.schedule_id
        JOIN routes r ON s.route_id = r.route_id
        JOIN buses b ON s.bus_id = b.bus_id
        ORDER BY bt.created_at DESC
      `;
      const result = await sql.query(selectQuery);
      busTimes = result.rows;
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
    const insertQuery = `INSERT INTO bus_times (schedule_id, route_stop_id, scheduled_departure_time, scheduled_arrival_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const result = await sql.query(insertQuery, [schedule_id, route_stop_id, scheduled_departure_time, scheduled_arrival_time]);
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create bus time:", error)
    return NextResponse.json({ error: "Failed to create bus time" }, { status: 500 })
  }
}
