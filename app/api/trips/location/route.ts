// /app/api/trips/location/route.ts (Next.js 13+ App Router)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const { bus_id, lat, lng } = await request.json();

    if (!bus_id || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid parameters" },
        { status: 400 }
      );
    }

    const locationRef = db.ref(`trips/${bus_id}/location`);

    await locationRef.set({
      lat,
      lng,
      updated_at: Date.now(),
    });

    console.log(`📍 Updated location for bus ${bus_id}:`, { lat, lng });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error in /api/trips/location:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update location" },
      { status: 500 }
    );
  }
}




// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/firebase";

// export async function POST(request: NextRequest) {
//   try {
//     const { bus_id, driver_id, lat, lng, timestamp } = await request.json();

//     if (!bus_id || !driver_id || lat == null || lng == null) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     let locationTime: string;

//     if (typeof timestamp === "string" && timestamp.trim() !== "") {
//       locationTime = timestamp;
//     } else if (
//       typeof timestamp === "object" &&
//       timestamp !== null &&
//       typeof timestamp.hour === "number" &&
//       typeof timestamp.minute === "number"
//     ) {
//       const hh = String(timestamp.hour).padStart(2, "0");
//       const mm = String(timestamp.minute).padStart(2, "0");
//       locationTime = `${hh}:${mm}`;
//     } else if (typeof timestamp === "number" && timestamp > 0) {
//       const dt = new Date(timestamp);
//       locationTime = dt.toLocaleTimeString("en-GB", {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } else {
//       const now = new Date();
//       locationTime = now.toLocaleTimeString("en-GB", {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     }

//     console.log("📍 Location update received:", {
//       bus_id,
//       driver_id,
//       lat,
//       lng,
//       timestamp: locationTime,
//     });

//     // Latest location
//     await db.ref(`trips/${bus_id}/location`).set({
//       lat,
//       lng,
//       timestamp: locationTime,
//     });

//     // History route
//     await db.ref(`trips/${bus_id}/route`).push({
//       lat,
//       lng,
//       timestamp: locationTime,
//     });

//     console.log("Location data saved to Firebase for bus:", bus_id);

//     return NextResponse.json({ success: true, timestamp: locationTime });
//   } catch (err) {
//     console.error("❌ Error in /api/trips/location:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to update location" },
//       { status: 500 }
//     );
//   }
// }
