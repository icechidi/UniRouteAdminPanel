import { type NextRequest, NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const sql = getSql();
    const result = await sql.query(
      `SELECT * FROM route_stops WHERE route_stop_id = $1`,
      [params.id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Route stop not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch route stop" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const body = await request.json();
    const { stop_name, stop_order, arrival_time, latitude, longitude } = body;
    const sql = getSql();
    const result = await sql.query(
      `UPDATE route_stops SET stop_name = $1, stop_order = $2, arrival_time = $3, latitude = $4, longitude = $5 WHERE route_stop_id = $6 RETURNING *`,
      [stop_name, stop_order ?? null, arrival_time ?? null, latitude ?? null, longitude ?? null, params.id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Route stop not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("PUT /api/route-stops/[id] error:", error);
    return NextResponse.json({ error: "Failed to update route stop" }, { status: 500 });
  }
}