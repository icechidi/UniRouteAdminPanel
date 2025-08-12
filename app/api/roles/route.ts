import { NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }
  try {
    const sql = getSql()
    const result = await sql.query("SELECT role_id, name FROM roles ORDER BY name ASC")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Failed to fetch roles:", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}
