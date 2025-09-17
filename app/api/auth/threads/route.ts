import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getThreadsAuthUrl } from "@/lib/threads/oauth"

export async function GET(request: NextRequest) {
  console.log("[v0] Threads OAuth request received")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] No authenticated user found")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[v0] Authenticated user:", user.id)

  const clientId = process.env.THREADS_CLIENT_ID
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/threads/callback`

  console.log("[v0] Client ID configured:", !!clientId)
  console.log("[v0] Base URL:", baseUrl)
  console.log("[v0] Redirect URI:", redirectUri)

  if (!clientId) {
    console.log("[v0] Threads client ID not configured")
    return NextResponse.json({ error: "Threads client ID not configured" }, { status: 500 })
  }

  const authUrl = getThreadsAuthUrl(clientId, redirectUri, user.id)
  console.log("[v0] Generated auth URL:", authUrl)

  return NextResponse.redirect(authUrl)
}
