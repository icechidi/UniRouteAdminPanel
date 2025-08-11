import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const semesterSchedules = await sql`
      SELECT * FROM semester_schedules ORDER BY academic_year DESC, semester
    `
    return NextResponse.json(semesterSchedules)
  } catch (error) {
    console.error("Failed to fetch semester schedules:", error)
    return NextResponse.json({ error: "Failed to fetch semester schedules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { academic_year, semester, start_date, end_date, holidays } = body

    const sql = getSql()
    const result = await sql`
      INSERT INTO semester_schedules (academic_year, semester, start_date, end_date, holidays)
      VALUES (
        ${academic_year},
        ${semester},
        ${start_date},
        ${end_date},
        ${holidays ? JSON.stringify(holidays) : null}::jsonb
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create semester schedule:", error)
    return NextResponse.json({ error: "Failed to create semester schedule" }, { status: 500 })
  }
}
