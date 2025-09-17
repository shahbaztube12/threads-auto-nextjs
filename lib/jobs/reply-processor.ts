import { createClient } from "@/lib/supabase/server"
import { ThreadsAPIClient } from "@/lib/threads/client"

export interface PendingReply {
  id: string
  user_id: string
  threads_account_id: string
  auto_reply_rule_id: string | null
  original_post_id: string
  original_post_content: string | null
  reply_content: string
  scheduled_for: string
  threads_account: {
    access_token: string
    username: string
  }
}

export class ReplyProcessor {
  private supabase = createClient()

  async processPendingReplies(): Promise<void> {
    console.log("[v0] Starting reply processing job...")

    try {
      // Get pending replies that are scheduled for now or earlier
      const { data: pendingReplies, error } = await (await this.supabase)
        .from("reply_history")
        .select(`
          *,
          threads_accounts!inner(access_token, username, token_expires_at)
        `)
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .limit(50)

      if (error) {
        console.error("[v0] Error fetching pending replies:", error)
        return
      }

      if (!pendingReplies || pendingReplies.length === 0) {
        console.log("[v0] No pending replies to process")
        return
      }

      console.log(`[v0] Processing ${pendingReplies.length} pending replies`)

      for (const reply of pendingReplies) {
        await this.processReply(reply as any)
      }
    } catch (error) {
      console.error("[v0] Error in reply processing job:", error)
    }
  }

  private async processReply(reply: PendingReply): Promise<void> {
    try {
      // Check if token is expired
      const tokenExpiresAt = new Date(reply.threads_account.token_expires_at)
      const now = new Date()

      if (now >= tokenExpiresAt) {
        await this.markReplyFailed(reply.id, "Access token expired")
        return
      }

      // Send the reply using Threads API
      const threadsClient = new ThreadsAPIClient(reply.threads_account.access_token)
      const replyResponse = await threadsClient.replyToThread(reply.original_post_id, reply.reply_content)

      // Mark as sent
      await (await this.supabase)
        .from("reply_history")
        .update({
          status: "sent",
          reply_post_id: replyResponse.id,
          sent_at: new Date().toISOString(),
        })
        .eq("id", reply.id)

      console.log(`[v0] Successfully sent reply ${reply.id} to post ${reply.original_post_id}`)
    } catch (error) {
      console.error(`[v0] Failed to send reply ${reply.id}:`, error)
      await this.markReplyFailed(reply.id, error instanceof Error ? error.message : "Unknown error")
    }
  }

  private async markReplyFailed(replyId: string, errorMessage: string): Promise<void> {
    await (await this.supabase)
      .from("reply_history")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", replyId)
  }

  async checkDailyLimits(userId: string, ruleId: string): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayReplies, error } = await (await this.supabase)
      .from("reply_history")
      .select("id")
      .eq("user_id", userId)
      .eq("auto_reply_rule_id", ruleId)
      .gte("created_at", today.toISOString())

    if (error) {
      console.error("[v0] Error checking daily limits:", error)
      return false
    }

    // Get the rule's daily limit
    const { data: rule, error: ruleError } = await (await this.supabase)
      .from("auto_reply_rules")
      .select("max_replies_per_day")
      .eq("id", ruleId)
      .single()

    if (ruleError || !rule) {
      console.error("[v0] Error fetching rule:", ruleError)
      return false
    }

    return (todayReplies?.length || 0) < rule.max_replies_per_day
  }
}
