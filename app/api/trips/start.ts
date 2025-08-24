import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  const { bus_id, driver_id, route_id } = await request.json()
  await db.ref(`trips/${bus_id}`).set({
    bus_id,
    driver_id,
    route_id,
    status: "active",
    start_time: Date.now()
  })
  return NextResponse.json({ success: true })
}