import { NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { schedule_id: string } }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }
  const sql = getSql()
  const schedule_id = Number(params.schedule_id)
  if (isNaN(schedule_id)) {
    return NextResponse.json({ error: "Invalid schedule_id" }, { status: 400 })
  }
  await sql.query("DELETE FROM bus_times WHERE schedule_id = $1", [schedule_id])
  await sql.query("DELETE FROM schedules WHERE schedule_id = $1", [schedule_id])
  return NextResponse.json({ success: true })
}

export async function PUT(request: NextRequest, { params }: { params: { schedule_id: string } }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }
  const sql = getSql()
  const schedule_id = Number(params.schedule_id)
  if (isNaN(schedule_id)) {
    return NextResponse.json({ error: "Invalid schedule_id" }, { status: 400 })
  }
  const body = await request.json()
  await sql.query(
    `UPDATE schedules SET 
      route_id = $1, bus_id = $2, sem_schedule_id = $3, type_of_schedule = $4, 
      start_date = $5, end_date = $6, days_of_week = $7, is_active = $8
      WHERE schedule_id = $9`,
    [
      body.route_id,
      body.bus_id,
      body.sem_schedule_id,
      body.type_of_schedule,
      body.start_date,
      body.end_date,
      body.days_of_week,
      body.is_active,
      body.bus_times,
      schedule_id
    ]
  )
  return NextResponse.json({ success: true })
}