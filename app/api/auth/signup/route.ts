 export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ message: "Database not configured" }, { status: 503 });
    }
    const { email, password, first_name, last_name, role } = await request.json();
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    const sql = getSql();
    // Check if user already exists
    const existing = await sql.query("SELECT user_id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }
    // Only allow admin creation if no admin exists
    let role_id = 3; // default: student
    if (role === "admin") {
      const adminExists = await sql.query("SELECT user_id FROM users WHERE role_id = 1");
      if (adminExists.rows.length > 0) {
        return NextResponse.json({ message: "Admin already exists" }, { status: 403 });
      }
      role_id = 1;
    } else if (role === "driver") {
      role_id = 2;
    }
    const password_hash = await hashPassword(password);
    const result = await sql.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING user_id, email, role_id`,
      [first_name, last_name, email, password_hash, role_id]
    );
    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
