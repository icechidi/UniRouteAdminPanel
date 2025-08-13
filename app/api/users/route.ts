import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const roleName = searchParams.get("role")

    const sql = getSql()
    let users

    if (roleName) {
      const selectQuery = `
        SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.phone, u.country, u.photo_url, u.language_pref, u.unique_id, u.created_at, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE r.name = $1
        ORDER BY u.created_at DESC
      `;
      const result = await sql.query(selectQuery, [roleName]);
      users = result.rows;
    } else {
      const selectQuery = `
        SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.phone, u.country, u.photo_url, u.language_pref, u.unique_id, u.created_at, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.created_at DESC
      `;
      const result = await sql.query(selectQuery);
      users = result.rows;
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const {
      role_id,
      first_name,
      last_name,
      username,
      password,
      email,
      phone,
      country,
      photo_url,
      language_pref,
    } = body

    const sql = getSql()
    const password_hash = password ? await hashPassword(password) : null
    
    const insertQuery = `INSERT INTO users (role_id, first_name, last_name, username, password_hash, email, phone, country, photo_url, language_pref)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING user_id, first_name, last_name, email`;
    const result = await sql.query(insertQuery, [role_id, first_name, last_name, username || null, password_hash, email, phone || null, country || null, photo_url || null, language_pref || null]);
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
