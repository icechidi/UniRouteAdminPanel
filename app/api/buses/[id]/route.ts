import { NextResponse } from "next/server"
import { getSql, isDemoMode } from "@/lib/db"

// Helper to get bus by id from demo data
function getDemoBus(id: number) {
  const { buses } = require("@/lib/db").DEMO_DATA
  return buses.find((bus: any) => bus.bus_id === id)
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (isDemoMode()) {
    const bus = getDemoBus(id)
    if (!bus) return NextResponse.json({ error: "Bus not found" }, { status: 404 })
    return NextResponse.json(bus)
  }
  const sql = getSql()
  const result = await sql.query("SELECT * FROM buses WHERE bus_id = $1", [id])
  if (result.rows.length === 0) return NextResponse.json({ error: "Bus not found" }, { status: 404 })
  return NextResponse.json(result.rows[0])
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const data = await req.json()
  if (isDemoMode()) {
    const { buses } = require("@/lib/db").DEMO_DATA
    const index = buses.findIndex((bus: any) => bus.bus_id === id)
    if (index === -1) return NextResponse.json({ error: "Bus not found" }, { status: 404 })
    buses[index] = { ...buses[index], ...data }
    return NextResponse.json(buses[index])
  }
  const sql = getSql()
  const result = await sql.query(
    `UPDATE buses SET bus_number = $1, license_plate = $2, capacity = $3, model = $4, year = $5, status = $6 WHERE bus_id = $7 RETURNING *`,
    [data.bus_number, data.license_plate, data.capacity, data.model, data.year, data.status, id]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: "Bus not found" }, { status: 404 })
  return NextResponse.json(result.rows[0])
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (isDemoMode()) {
    const { buses } = require("@/lib/db").DEMO_DATA
    const index = buses.findIndex((bus: any) => bus.bus_id === id)
    if (index === -1) return NextResponse.json({ error: "Bus not found" }, { status: 404 })
    buses.splice(index, 1)
    return NextResponse.json({ success: true })
  }
  const sql = getSql()
  const result = await sql.query("DELETE FROM buses WHERE bus_id = $1 RETURNING *", [id])
  if (result.rows.length === 0) return NextResponse.json({ error: "Bus not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
