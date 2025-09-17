import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exchangeCodeForToken } from "@/lib/threads/oauth"
import { ThreadsAPIClient } from "@/lib/threads/client"

export async function GET(request: NextRequest) {
  console.log("[v0] Threads OAuth callback received")

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") // This should be the user ID
  const error = searchParams.get("error")

  console.log("[v0] OAuth callback parameters:", {
    hasCode: !!code,
    hasState: !!state,
    error: error,
    fullUrl: request.url,
  })

  if (error) {
    console.log("[v0] OAuth error received:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=threads_auth_failed`)
  }

  if (!code || !state) {
    console.log("[v0] Missing required parameters - code:", !!code, "state:", !!state)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_code`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] User authentication check:", {
    hasUser: !!user,
    userId: user?.id,
    stateMatches: user?.id === state,
  })

  if (!user || user.id !== state) {
    console.log("[v0] User authentication failed or state mismatch")
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=unauthorized`)
  }

  try {
    const clientId = process.env.THREADS_CLIENT_ID!
    const clientSecret = process.env.THREADS_CLIENT_SECRET!
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/threads/callback`

    console.log("[v0] Starting token exchange with redirect URI:", redirectUri)

    // Exchange code for short-lived token
    const tokenResponse = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri)
    console.log("[v0] Short-lived token obtained successfully")

    // Exchange for long-lived token
    const longLivedToken = await ThreadsAPIClient.exchangeForLongLivedToken(tokenResponse.access_token, clientSecret)
    console.log("[v0] Long-lived token obtained successfully")

    // Get user info from Threads
    const threadsClient = new ThreadsAPIClient(longLivedToken.access_token)
    const threadsUser = await threadsClient.getUser()
    console.log("[v0] Threads user info retrieved:", { id: threadsUser.id, username: threadsUser.username })

    // Store the account in database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60) // Long-lived tokens expire in 60 days

    const { error: dbError } = await supabase.from("threads_accounts").upsert({
      user_id: user.id,
      threads_user_id: threadsUser.id,
      username: threadsUser.username,
      access_token: longLivedToken.access_token,
      token_expires_at: expiresAt.toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=database_error`)
    }

    console.log("[v0] Threads account successfully stored in database")
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=threads_connected`)
  } catch (error) {
    console.error("[v0] Threads OAuth error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_failed`)
  }
}
