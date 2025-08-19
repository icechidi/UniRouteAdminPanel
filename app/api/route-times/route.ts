import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured, getRouteTimes } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get("routeId")

    const routeTimes = await getRouteTimes(routeId ? Number.parseInt(routeId) : undefined)
    return NextResponse.json(routeTimes)
  } catch (error) {
    console.error("Failed to fetch route times:", error)
    return NextResponse.json({ error: "Failed to fetch route times" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { route_id, departure_time, is_active = true } = body

    const sql = getSql()
    const insertQuery = `
      INSERT INTO route_times (route_id, departure_time, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `

    const result = await sql.query(insertQuery, [route_id, departure_time, is_active])
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create route time:", error)
    return NextResponse.json(
      { error: (error as any)?.message || "Failed to create route time" },
      { status: 500 }
    )
  }
}
export async function PUT(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    const body = await request.json()
    const { route_time_id, departure_time, is_active } = body
    const sql = getSql()
    const updateQuery = `
      UPDATE route_times
      SET departure_time = $1, is_active = $2
      WHERE route_time_id = $3
      RETURNING *
    `
    const result = await sql.query(updateQuery, [departure_time, is_active, route_time_id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Route time not found" }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Failed to update route time:", error)
    return NextResponse.json({ error: "Failed to update route time" }, { status: 500 })
  }
}

// DELETE: Delete a route time by ID
export async function DELETE(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    const { searchParams } = new URL(request.url)
    const route_time_id = searchParams.get("route_time_id")
    if (!route_time_id) {
      return NextResponse.json({ error: "route_time_id is required" }, { status: 400 })
    }
    const sql = getSql()
    const deleteQuery = `
      DELETE FROM route_times
      WHERE route_time_id = $1
      RETURNING *
    `
    const result = await sql.query(deleteQuery, [route_time_id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Route time not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete route time:", error)
    return NextResponse.json({ error: "Failed to delete route time" }, { status: 500 })
  }
}