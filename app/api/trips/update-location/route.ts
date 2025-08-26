import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bus_id = body.bus_id ?? body.busId;
    const driver_id = body.driver_id ?? body.driverId;
    const lat = body.lat;
    const lng = body.lng;
    const timestamp = body.timestamp ?? new Date().toISOString();

    if (!bus_id || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.ref(`trips/${bus_id}/location`).set({
      lat,
      lng,
      updated_at: timestamp,
      driver_id,
    });

    console.log(`📍 Location updated for bus ${bus_id}:`, { lat, lng });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error in /api/trips/updateLocation:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update location" },
      { status: 500 }
    );
  }
}
