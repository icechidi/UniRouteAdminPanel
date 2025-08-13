import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const sql = getSql();
    let result;
    if (category) {
      result = await sql.query("SELECT * FROM messages WHERE category = $1 ORDER BY created_at DESC", [category]);
    } else {
      result = await sql.query("SELECT * FROM messages ORDER BY created_at DESC");
    }
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { message_text, category } = body

    const sql = getSql()
    const result = await sql.query(
      "INSERT INTO messages (message_text, category) VALUES ($1, $2) RETURNING *",
      [message_text, category]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
