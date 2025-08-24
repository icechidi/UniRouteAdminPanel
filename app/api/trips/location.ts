import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  const { trip_id, latitude, longitude, bus_id } = await request.json()
  // Save location to Firebase Realtime Database
  await db.ref(`liveLocations/${bus_id}`).set({
    trip_id,
    latitude,
    longitude,
    timestamp: Date.now()
  })
  return NextResponse.json({ success: true })
}