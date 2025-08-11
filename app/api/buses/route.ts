import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      console.error("Database not configured")
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql();
    const result = await sql.query("SELECT * FROM buses ORDER BY created_at DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch buses:", error)
    return NextResponse.json({ error: "Failed to fetch buses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      console.error("Database not configured")
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { bus_number, license_plate, capacity, model, year, status } = body

    // Validate required fields
    if (!bus_number || !license_plate || !capacity || !model || !year || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getSql()
    const insertQuery = `INSERT INTO buses (bus_number, license_plate, capacity, model, year, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const result = await sql.query(insertQuery, [bus_number, license_plate, capacity, model, year, status]);
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    console.error("Failed to create bus:", error)
    return NextResponse.json({ error: error?.message || "Failed to create bus" }, { status: 500 })
  }
}
