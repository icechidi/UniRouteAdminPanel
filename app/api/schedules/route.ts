import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const schedulesResult = await sql.query(
      `SELECT s.*,
             r.route_name,
             b.bus_number,
             ss.academic_year,
             ss.semester,
             ss.start_date as sem_start_date,
             ss.end_date as sem_end_date,
             ss.holidays
        FROM schedules s
        JOIN routes r ON s.route_id = r.route_id
        JOIN buses b ON s.bus_id = b.bus_id
        LEFT JOIN semester_schedules ss ON s.sem_schedule_id = ss.sem_schedule_id
        ORDER BY s.created_at DESC`
    )
    return NextResponse.json(schedulesResult.rows)
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
      sem_schedule_id,
      type_of_schedule,
      start_date,
      end_date,
      days_of_week,
      is_active,
      bus_times, // Array of { route_stop_id, route_time_id, scheduled_departure_time, scheduled_arrival_time }
    } = body

    const sql = getSql()

    // Insert schedule
    const scheduleResult = await sql.query(
      `INSERT INTO schedules (route_id, bus_id, sem_schedule_id, type_of_schedule, start_date, end_date, days_of_week, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
       RETURNING *`,
      [
        route_id,
        bus_id,
        sem_schedule_id || null,
        type_of_schedule,
        start_date || null,
        end_date || null,
        days_of_week ? JSON.stringify(days_of_week) : null,
        is_active
      ]
    )
    const schedule = scheduleResult.rows[0]

    // Insert bus times for this schedule
    if (bus_times && bus_times.length > 0) {
      for (const bt of bus_times) {
        await sql.query(
          `INSERT INTO bus_times (schedule_id, route_stop_id, route_time_id, scheduled_departure_time, scheduled_arrival_time)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            schedule.schedule_id,
            bt.route_stop_id,
            bt.route_time_id || null,
            bt.scheduled_departure_time,
            bt.scheduled_arrival_time
          ]
        )
      }
    }

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error("Failed to create schedule:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}

