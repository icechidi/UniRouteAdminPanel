import { NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const sql = getSql();
    const result = await sql.query(
      `SELECT * FROM route_stops ORDER BY route_id, stop_order`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch route stops:", error);
    return NextResponse.json({ error: "Failed to fetch route stops" }, { status: 500 });
  }
}