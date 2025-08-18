import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const query = (`
      SELECT r.*, 
             COUNT(DISTINCT rs.route_stop_id) as stops_count,
             COUNT(DISTINCT rt.route_time_id) as times_count
      FROM routes r
      LEFT JOIN route_stops rs ON r.route_id = rs.route_id
      LEFT JOIN route_times rt ON r.route_id = rt.route_id
      GROUP BY r.route_id
      ORDER BY r.created_at DESC
    `)
    const result = await sql.query(query)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Failed to fetch routes:", error)
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { route_name, is_active, stops, route_times } = body

    const sql = getSql()
    await sql.query("BEGIN")

    try {
      // Insert route
      let routeResult
      try {
        routeResult = await sql.query(
          `INSERT INTO routes (route_name, is_active)
           VALUES ($1, $2)
           RETURNING *`,
          [route_name, is_active]
        )
      } catch (error: any) {
        if (error.code === "23505") {
          // Duplicate route_name
          await sql.query("ROLLBACK")
          return NextResponse.json(
            { error: `Route name '${route_name}' already exists.` },
            { status: 409 }
          )
        }
        throw error
      }

      const route = routeResult.rows[0]

      // Insert route times
      if (route_times && route_times.length > 0) {
        for (const time of route_times) {
          await sql.query(
            `INSERT INTO route_times (route_id, departure_time, is_active)
             VALUES ($1, $2, true)`,
            [route.route_id, time.departure_time]
          )
        }
      }

      // Insert stops
      if (stops && stops.length > 0) {
        for (let i = 0; i < stops.length; i++) {
          const stop = stops[i]
          await sql.query(
            `INSERT INTO route_stops (route_id, stop_name, longitude, latitude, stop_order, estimated_duration)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              route.route_id,
              stop.stop_name,
              stop.longitude || null,
              stop.latitude || null,
              i + 1,
              stop.estimated_duration || 0,
            ]
          )
        }
      }

      await sql.query("COMMIT")
      return NextResponse.json(route, { status: 201 })
    } catch (error) {
      await sql.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Failed to create route:", error)
    return NextResponse.json(
      { error: (error as any)?.message || "Failed to create route" },
      { status: 500 }
    )
  }
}
