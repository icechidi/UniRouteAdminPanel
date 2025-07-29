import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const routes = await sql`
      SELECT r.*, 
             COUNT(rs.id) as stops_count
      FROM routes r 
      LEFT JOIN route_stops rs ON r.id = rs.route_id 
      GROUP BY r.id 
      ORDER BY r.created_at DESC
    `
    return NextResponse.json(routes)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { title, from_location, to_location, distance_km, estimated_duration, status, stops } = body

    const sql = getSql()
    // Insert route
    const routeResult = await sql`
      INSERT INTO routes (title, from_location, to_location, distance_km, estimated_duration, status)
      VALUES (${title}, ${from_location}, ${to_location}, ${distance_km}, ${estimated_duration}, ${status})
      RETURNING *
    `

    const route = routeResult[0]

    // Insert stops
    if (stops && stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i]
        await sql`
          INSERT INTO route_stops (route_id, stop_name, stop_order)
          VALUES (${route.id}, ${stop.name}, ${i + 1})
        `
      }
    }

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 })
  }
}
