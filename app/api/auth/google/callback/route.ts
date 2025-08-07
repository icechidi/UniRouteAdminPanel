import { type NextRequest, NextResponse } from "next/server"
import { getSql, isDatabaseConfigured } from "@/lib/db"
import { createSession } from "@/lib/auth"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
  : "http://localhost:3000/api/auth/google/callback"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url))
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.redirect(new URL("/setup?error=db_not_configured", request.url))
  }

  try {
    const sql = getSql()

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID || "",
        client_secret: GOOGLE_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const googleUser = await userResponse.json()

    if (!googleUser.email) {
      throw new Error("Failed to get user email")
    }

    // Get student role ID
    const roles = await sql`SELECT role_id FROM roles WHERE name = 'student'`
    const studentRoleId = roles[0]?.role_id || null

    if (!studentRoleId) {
      throw new Error("Student role not found in database. Please initialize roles.")
    }

    // Check if user exists in our database
    const users = await sql`
      SELECT user_id, first_name, last_name, email, role_id
      FROM users
      WHERE email = ${googleUser.email} OR google_id = ${googleUser.id}
    `

    let user
    if (users.length === 0) {
      // Create new user if doesn't exist
      const newUsers = await sql`
        INSERT INTO users (first_name, last_name, email, role_id, google_id, photo_url, created_at, updated_at)
        VALUES (
          ${googleUser.given_name || googleUser.email.split('@')[0]},
          ${googleUser.family_name || ''},
          ${googleUser.email},
          ${studentRoleId},
          ${googleUser.id},
          ${googleUser.picture || null},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING user_id, first_name, last_name, email, role_id
      `
      user = newUsers[0]
    } else {
      user = users[0]
      // Update existing user with google_id and photo_url if not present
      if (!user.google_id || !user.photo_url) {
        await sql`
          UPDATE users
          SET google_id = ${googleUser.id}, photo_url = ${googleUser.picture || null}, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${user.user_id}
        `
      }
    }

    // Create session
    await createSession(user.user_id)

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url))
  }
}
