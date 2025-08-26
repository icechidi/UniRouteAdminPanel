import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // using compat API (db.ref())

export async function POST(request: NextRequest) {
  try {
    const { bus_id, driver_id, route_id, start_time } = await request.json();

    let finalStartTime: string;

    if (typeof start_time === "string" && start_time.trim() !== "") {
      // Already a string like "09:30"
      finalStartTime = start_time;
    } else if (
      typeof start_time === "object" &&
      start_time !== null &&
      typeof start_time.hour === "number" &&
      typeof start_time.minute === "number"
    ) {
      // Flutter TimeOfDay object {hour: 9, minute: 30}
      const hh = String(start_time.hour).padStart(2, "0");
      const mm = String(start_time.minute).padStart(2, "0");
      finalStartTime = `${hh}:${mm}`;
    } else if (typeof start_time === "number" && start_time > 0) {
      // Timestamp
      const dt = new Date(start_time);
      finalStartTime = dt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Fallback: server current time HH:mm
      const now = new Date();
      finalStartTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    console.log("🚍 Start trip request received:", {
      bus_id,
      driver_id,
      route_id,
      start_time: finalStartTime,
    });

    // Save to Firebase Realtime DB
    await db.ref(`trips/${bus_id}`).set({
      bus_id,
      driver_id,
      route_id,
      status: "active",
      start_time: finalStartTime,
      location: {
        lat: null,
        lng: null,
        updated_at: null,
      },
    });

    console.log("✅ Trip data saved to Firebase for bus:", bus_id);

    return NextResponse.json({ success: true, start_time: finalStartTime });
  } catch (err) {
    console.error("❌ Error in /api/trips/start:", err);
    return NextResponse.json(
      { success: false, error: "Failed to start trip" },
      { status: 500 }
    );
  }
}
