import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
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

  try {
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

    // Check if user exists in our database
    const users = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE email = ${googleUser.email}
    `

    let user
    if (users.length === 0) {
      // Create new user if doesn't exist
      const newUsers = await sql`
        INSERT INTO users (name, email, role, created_at, updated_at)
        VALUES (${googleUser.name || googleUser.email}, ${googleUser.email}, 'student', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, email, role
      `
      user = newUsers[0]
    } else {
      user = users[0]
    }

    // Create session
    await createSession(user.id)

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url))
  }
}
