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
             r.route_name,
             b.bus_number,
             u.first_name || ' ' || u.last_name as driver_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      LEFT JOIN users u ON s.driver_user_id = u.user_id
      ORDER BY s.created_at DESC
    `
    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Failed to fetch schedules:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const {
      route_id,
      bus_id,
      driver_user_id,
      type_of_schedule,
      start_date,
      end_date,
      days_of_week,
      is_active,
      bus_times, // Array of { route_stop_id, scheduled_departure_time, scheduled_arrival_time }
    } = body

    const sql = getSql()

    // Insert schedule
    const scheduleResult = await sql`
      INSERT INTO schedules (route_id, bus_id, driver_user_id, type_of_schedule, start_date, end_date, days_of_week, is_active)
      VALUES (
        ${route_id},
        ${bus_id},
        ${driver_user_id},
        ${type_of_schedule},
        ${start_date || null},
        ${end_date || null},
        ${days_of_week ? JSON.stringify(days_of_week) : null}::jsonb,
        ${is_active}
      )
      RETURNING *
    `
    const schedule = scheduleResult[0]

    // Insert bus times for this schedule
    if (bus_times && bus_times.length > 0) {
      for (const bt of bus_times) {
        await sql`
          INSERT INTO bus_times (schedule_id, route_stop_id, scheduled_departure_time, scheduled_arrival_time)
          VALUES (
            ${schedule.schedule_id},
            ${bt.route_stop_id},
            ${bt.scheduled_departure_time},
        const insertQuery = `INSERT INTO schedules (route_id, bus_id, driver_user_id, type_of_schedule, start_date, end_date, days_of_week, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`;
        const scheduleResult = await sql.query(insertQuery, [route_id, bus_id, driver_user_id, type_of_schedule, start_date || null, end_date || null, days_of_week ? JSON.stringify(days_of_week) : null, is_active]);
    }
