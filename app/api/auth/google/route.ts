import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
  : "http://localhost:3000/api/auth/google/callback"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url))
  }

  // Redirect to Google OAuth
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID || "")
  googleAuthUrl.searchParams.set("redirect_uri", REDIRECT_URI)
  googleAuthUrl.searchParams.set("response_type", "code")
  googleAuthUrl.searchParams.set("scope", "email profile")
  googleAuthUrl.searchParams.set("access_type", "offline")

  return NextResponse.redirect(googleAuthUrl.toString())
}
