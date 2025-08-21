import { NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }
  const sql = getSql()
  const { searchParams } = new URL(request.url)
  const route_id = Number(searchParams.get("route_id"))
  if (isNaN(route_id)) {
    return NextResponse.json({ error: "Invalid route_id" }, { status: 400 })
  }
  const stopsResult = await sql.query(
    "SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order ASC",
    [route_id]
  )
  return NextResponse.json(stopsResult.rows)
}