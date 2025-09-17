import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ThreadsAPIClient } from "@/lib/threads/client"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { postId, replyText, threadsAccountId } = await request.json()

    if (!postId || !replyText || !threadsAccountId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the threads account
    const { data: threadsAccount, error: accountError } = await supabase
      .from("threads_accounts")
      .select("*")
      .eq("id", threadsAccountId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (accountError || !threadsAccount) {
      return NextResponse.json({ error: "Threads account not found" }, { status: 404 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(threadsAccount.token_expires_at)

    if (now >= expiresAt) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    // Create reply using Threads API
    const threadsClient = new ThreadsAPIClient(threadsAccount.access_token)
    const replyResponse = await threadsClient.replyToThread(postId, replyText)

    // Log the reply in history
    const { error: historyError } = await supabase.from("reply_history").insert({
      user_id: user.id,
      threads_account_id: threadsAccountId,
      original_post_id: postId,
      reply_post_id: replyResponse.id,
      reply_content: replyText,
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    if (historyError) {
      console.error("Failed to log reply history:", historyError)
    }

    return NextResponse.json({
      success: true,
      replyId: replyResponse.id,
    })
  } catch (error) {
    console.error("Reply error:", error)
    return NextResponse.json(
      {
        error: "Failed to send reply",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
