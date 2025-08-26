import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Normalize possible variations from frontend
    const bus_id = body.bus_id ?? body.busId;
    const driver_id = body.driver_id ?? body.driverId;
    const route_id = body.route_id ?? body.route;
    const rawEndTime = body.end_time;

    let finalEndTime: string;

    if (typeof rawEndTime === "string" && rawEndTime.trim() !== "") {
      finalEndTime = rawEndTime;
    } else if (
      typeof rawEndTime === "object" &&
      rawEndTime !== null &&
      typeof rawEndTime.hour === "number" &&
      typeof rawEndTime.minute === "number"
    ) {
      const hh = String(rawEndTime.hour).padStart(2, "0");
      const mm = String(rawEndTime.minute).padStart(2, "0");
      finalEndTime = `${hh}:${mm}`;
    } else if (typeof rawEndTime === "number" && rawEndTime > 0) {
      const dt = new Date(rawEndTime);
      finalEndTime = dt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      const now = new Date();
      finalEndTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    console.log("🛑 End trip request received:", {
      bus_id,
      driver_id,
      route_id,
      end_time: finalEndTime,
    });

    if (!bus_id) {
      return NextResponse.json(
        { success: false, error: "Missing bus_id" },
        { status: 400 }
      );
    }

    await db.ref(`trips/${bus_id}`).update({
      status: "completed",
      end_time: finalEndTime,
    });

    console.log("✅ Trip end data saved to Firebase for bus:", bus_id);

    return NextResponse.json({
      success: true,
      bus_id,
      driver_id,
      route_id,
      end_time: finalEndTime,
    });
  } catch (err) {
    console.error("❌ Error in /api/trips/end:", err);
    return NextResponse.json(
      { success: false, error: "Failed to end trip" },
      { status: 500 }
    );
  }
}
