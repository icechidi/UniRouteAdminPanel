import { NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }
  const sql = getSql()
  const result = await sql.query(`
    SELECT
      r.route_id,
      r.route_name,
      rt.route_time_id,
      rt.departure_time AS route_departure_time,
      rs.route_stop_id,
      rs.stop_order,
      rs.stop_name,
      (rt.departure_time + (rs.estimated_duration * INTERVAL '1 minute')) AS arrival_time
    FROM routes r
    JOIN route_times rt ON r.route_id = rt.route_id
    JOIN route_stops rs ON r.route_id = rs.route_id
    WHERE rt.is_active = TRUE
    ORDER BY r.route_name, rt.departure_time, rs.stop_order;
  `)
  return NextResponse.json(result.rows)
}

// Example PATCH handler for editing a stop name or order
export async function PATCH(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }
  const sql = getSql()
  const body = await request.json()
  // You can extend this for other fields
  await sql.query(
    "UPDATE route_stops SET stop_name = $1, stop_order = $2 WHERE route_stop_id = $3",
    [body.stop_name, body.stop_order, body.route_stop_id]
  )
  return NextResponse.json({ success: true })
}