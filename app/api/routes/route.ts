import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql();
    const result = await sql.query(`SELECT r.*, COUNT(rs.route_stop_id) as stops_count FROM routes r LEFT JOIN route_stops rs ON r.route_id = rs.route_id GROUP BY r.route_id ORDER BY r.created_at DESC`);
    return NextResponse.json(result.rows);
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
        const { route_name, is_active, stops } = body

        const sql = getSql()
        // Insert route
        const insertQuery = `INSERT INTO routes (route_name, is_active)
          VALUES ($1, $2)
          RETURNING *`;
        let routeResult;
        try {
            routeResult = await sql.query(insertQuery, [route_name, is_active]);
        } catch (error: any) {
            if (error.code === '23505') {
                // Duplicate route_name
                return NextResponse.json({ error: `Route name '${route_name}' already exists.` }, { status: 409 })
            }
            throw error;
        }
        const route = routeResult.rows[0]

        // Insert stops
        if (stops && stops.length > 0) {
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i]
                const stopInsertQuery = `INSERT INTO route_stops (route_id, stop_name, longitude, latitude, stop_order, arrival_time)
                  VALUES ($1, $2, $3, $4, $5, $6)`;
                await sql.query(stopInsertQuery, [
                  route.route_id,
                  stop.stop_name,
                  stop.longitude,
                  stop.latitude,
                  i + 1,
                  stop.arrival_time
                ]);
            }
        }

        return NextResponse.json(route, { status: 201 })
    } catch (error) {
        console.error("Failed to create route:", error)
        return NextResponse.json({ error: (error as any)?.message || "Failed to create route" }, { status: 500 })
    }
}
