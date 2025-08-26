import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // using compat API (db.ref())

export async function POST(request: NextRequest) {
  try {
    const { bus_id, driver_id, route_id, start_time, latitude, longitude } =
      await request.json();

    // --- Format start_time ---
    let finalStartTime: string;

    if (typeof start_time === "string" && start_time.trim() !== "") {
      finalStartTime = start_time;
    } else if (
      typeof start_time === "object" &&
      start_time !== null &&
      typeof start_time.hour === "number" &&
      typeof start_time.minute === "number"
    ) {
      const hh = String(start_time.hour).padStart(2, "0");
      const mm = String(start_time.minute).padStart(2, "0");
      finalStartTime = `${hh}:${mm}`;
    } else if (typeof start_time === "number" && start_time > 0) {
      const dt = new Date(start_time);
      finalStartTime = dt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
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
      latitude,
      longitude,
    });

    // --- Save to Firebase Realtime DB ---
    const tripRef = db.ref(`trips/${bus_id}`);
    await tripRef.set({
      bus_id,
      driver_id,
      route_id,
      status: "active",
      start_time: finalStartTime,
      location: {
        lat: typeof latitude === "number" ? latitude : null,
        lng: typeof longitude === "number" ? longitude : null,
        updated_at:
          typeof latitude === "number" && typeof longitude === "number"
            ? new Date().toISOString()
            : null,
      },
    });

    if (latitude == null || longitude == null) {
      console.warn(
        `⚠️ Latitude or longitude missing for bus ${bus_id}. Make sure frontend sends actual location.`
      );
    }

    console.log("✅ Trip data saved to Firebase for bus:", bus_id);

    return NextResponse.json({
      success: true,
      start_time: finalStartTime,
      latitude,
      longitude,
    });
  } catch (err) {
    console.error("❌ Error in /api/trips/start:", err);
    return NextResponse.json(
      { success: false, error: "Failed to start trip" },
      { status: 500 }
    );
  }
}
