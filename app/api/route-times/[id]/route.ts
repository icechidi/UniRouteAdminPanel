import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const routeTimeId = Number.parseInt(params.id)
    const body = await request.json()
    const { departure_time, is_active } = body

    const sql = getSql()
    const updateQuery = `
      UPDATE route_times
      SET departure_time = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
      WHERE route_time_id = $3
      RETURNING *
    `
    const result = await sql.query(updateQuery, [departure_time, is_active, routeTimeId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Route time not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Failed to update route time:", error)
    return NextResponse.json(
      { error: (error as any)?.message || "Failed to update route time" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const routeTimeId = Number.parseInt(params.id)
    const sql = getSql()

    const deleteQuery = `
      DELETE FROM route_times 
      WHERE route_time_id = $1
      RETURNING *
    `
    const result = await sql.query(deleteQuery, [routeTimeId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Route time not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Route time deleted successfully" })
  } catch (error) {
    console.error("Failed to delete route time:", error)
    return NextResponse.json(
      { error: (error as any)?.message || "Failed to delete route time" },
      { status: 500 }
    )
  }
}
