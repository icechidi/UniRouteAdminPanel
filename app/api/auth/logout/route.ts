// import { NextResponse } from "next/server"
// import { logout } from "@/lib/auth"

// app/api/auth/logout/route.ts
import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" })

  response.cookies.set({
    name: "demo_session",
    value: "",
    path: "/",
    expires: new Date(0),
  })

  return response
}

// export async function POST() {
//   try {
//     await logout()
//     return NextResponse.json({ success: true })
//   } catch (error) {
//     return NextResponse.json({ message: "Logout failed" }, { status: 500 })
//   }
// }
