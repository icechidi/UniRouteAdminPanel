import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const sql = getSql()
    const semesterSchedulesResult = await sql.query(
      "SELECT * FROM semester_schedules ORDER BY academic_year DESC, semester"
    )
    // Parse holidays field for each row
    const semesterSchedules = semesterSchedulesResult.rows.map(row => ({
      ...row,
      holidays: typeof row.holidays === "string" ? JSON.parse(row.holidays) : row.holidays
    }))
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
    const result = await sql.query(
      "INSERT INTO semester_schedules (academic_year, semester, start_date, end_date, holidays) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [academic_year, semester, start_date, end_date, JSON.stringify(holidays)]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create semester schedule:", error)
    return NextResponse.json({ error: "Failed to create semester schedule" }, { status: 500 })
  }
}

