import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const { bus_id, end_time } = await request.json();

    let finalEndTime: string;

    if (typeof end_time === "string" && end_time.trim() !== "") {
      finalEndTime = end_time;
    } else if (
      typeof end_time === "object" &&
      end_time !== null &&
      typeof end_time.hour === "number" &&
      typeof end_time.minute === "number"
    ) {
      const hh = String(end_time.hour).padStart(2, "0");
      const mm = String(end_time.minute).padStart(2, "0");
      finalEndTime = `${hh}:${mm}`;
    } else if (typeof end_time === "number" && end_time > 0) {
      const dt = new Date(end_time);
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

    console.log("🛑 End trip request received:", { bus_id, end_time: finalEndTime });

    await db.ref(`trips/${bus_id}`).update({
      status: "completed",
      end_time: finalEndTime,
    });

    console.log("Trip end data saved to Firebase for bus:", bus_id);

    return NextResponse.json({ success: true, end_time: finalEndTime });
  } catch (err) {
    console.error("❌ Error in /api/trips/end:", err);
    return NextResponse.json(
      { success: false, error: "Failed to end trip" },
      { status: 500 }
    );
  }
}
