import { type NextRequest, NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";

// GET a single route by ID, including its stops
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const sql = getSql();
    const routeResult = await sql.query(
      `SELECT * FROM routes WHERE route_id = $1`,
      [params.id]
    );
    if (routeResult.rows.length === 0) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
    const stopsResult = await sql.query(
      `SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order`,
      [params.id]
    );
    return NextResponse.json({
      route: routeResult.rows[0],
      stops: stopsResult.rows
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 });
  }
}

// PUT update a route by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const body = await request.json();
    const { route_name, is_active, stops } = body;
    const sql = getSql();

    // Update route
    await sql.query(
      `UPDATE routes SET route_name = $1, is_active = $2 WHERE route_id = $3`,
      [route_name, is_active, params.id]
    );

    // Get existing stops from DB
    const existingStopsResult = await sql.query(
      `SELECT route_stop_id FROM route_stops WHERE route_id = $1`,
      [params.id]
    );
    const existingStopIds = existingStopsResult.rows.map((row: any) => row.route_stop_id);

    // Find stops to delete (those not in the new stops array)
    const newStopIds = stops.filter(s => s.route_stop_id).map(s => s.route_stop_id);
    const stopsToDelete = existingStopIds.filter(id => !newStopIds.includes(id));
    if (stopsToDelete.length > 0) {
      await sql.query(
        `DELETE FROM route_stops WHERE route_stop_id = ANY($1::int[])`,
        [stopsToDelete]
      );
    }

    // Update or insert stops
    for (const [idx, stop] of stops.entries()) {
      if (stop.route_stop_id) {
        // Update existing stop
        await sql.query(
          `UPDATE route_stops SET stop_name = $1, stop_order = $2, arrival_time = $3, latitude = $4, longitude = $5 WHERE route_stop_id = $6`,
          [stop.stop_name, idx + 1, stop.arrival_time ?? null, stop.latitude ?? null, stop.longitude ?? null, stop.route_stop_id]
        );
      } else {
        // Insert new stop
        await sql.query(
          `INSERT INTO route_stops (route_id, stop_name, stop_order, arrival_time, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6)`,
          [params.id, stop.stop_name, idx + 1, stop.arrival_time ?? null, stop.latitude ?? null, stop.longitude ?? null]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/routes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update route and stops" }, { status: 500 });
  }
}

// DELETE a route by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const sql = getSql();
    // Delete associated stops first
    await sql.query(`DELETE FROM route_stops WHERE route_id = $1`, [params.id]);
    // Delete the route
    const result = await sql.query(
      `DELETE FROM routes WHERE route_id = $1 RETURNING *`,
      [params.id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 });
  }
}