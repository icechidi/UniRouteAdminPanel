import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  const { bus_id } = await request.json()
  await db.ref(`trips/${bus_id}/status`).set("completed")
  return NextResponse.json({ success: true })
}