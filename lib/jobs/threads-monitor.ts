import { createClient } from "@/lib/supabase/server"
import { ThreadsAPIClient } from "@/lib/threads/client"
import { ReplyProcessor } from "./reply-processor"

export interface AutoReplyRule {
  id: string
  user_id: string
  name: string
  trigger_keywords: string[]
  reply_template_id: string | null
  custom_reply_text: string | null
  delay_minutes: number
  threads_account_id: string
  threads_account: {
    access_token: string
    username: string
    threads_user_id: string
  }
  reply_template?: {
    content: string
  }
}

export class ThreadsMonitor {
  private supabase = createClient()
  private replyProcessor = new ReplyProcessor()

  async monitorThreadsForReplies(): Promise<void> {
    console.log("[v0] Starting Threads monitoring job...")

    try {
      // Get all active auto-reply rules
      const { data: rules, error } = await (await this.supabase)
        .from("auto_reply_rules")
        .select(`
          *,
          threads_accounts!inner(access_token, username, threads_user_id, token_expires_at),
          reply_templates(content)
        `)
        .eq("is_active", true)

      if (error) {
        console.error("[v0] Error fetching active rules:", error)
        return
      }

      if (!rules || rules.length === 0) {
        console.log("[v0] No active auto-reply rules found")
        return
      }

      console.log(`[v0] Monitoring ${rules.length} active rules`)

      // Group rules by account to avoid duplicate API calls
      const rulesByAccount = new Map<string, AutoReplyRule[]>()
      for (const rule of rules as any[]) {
        const accountId = rule.threads_account_id
        if (!rulesByAccount.has(accountId)) {
          rulesByAccount.set(accountId, [])
        }
        rulesByAccount.get(accountId)!.push(rule)
      }

      // Process each account
      for (const [accountId, accountRules] of rulesByAccount) {
        await this.processAccountRules(accountRules)
      }
    } catch (error) {
      console.error("[v0] Error in Threads monitoring job:", error)
    }
  }

  private async processAccountRules(rules: AutoReplyRule[]): Promise<void> {
    if (rules.length === 0) return

    const firstRule = rules[0]
    const account = firstRule.threads_account

    try {
      // Check if token is expired
      const tokenExpiresAt = new Date(account.token_expires_at)
      const now = new Date()

      if (now >= tokenExpiresAt) {
        console.log(`[v0] Token expired for account @${account.username}`)
        return
      }

      // Get recent threads for this account
      const threadsClient = new ThreadsAPIClient(account.access_token)
      const threadsResponse = await threadsClient.getUserThreads("me", 25)

      if (!threadsResponse.data || threadsResponse.data.length === 0) {
        console.log(`[v0] No recent threads found for @${account.username}`)
        return
      }

      console.log(`[v0] Found ${threadsResponse.data.length} recent threads for @${account.username}`)

      // Check each thread against all rules for this account
      for (const thread of threadsResponse.data) {
        await this.processThreadAgainstRules(thread, rules)
      }
    } catch (error) {
      console.error(`[v0] Error processing account @${account.username}:`, error)
    }
  }

  private async processThreadAgainstRules(thread: any, rules: AutoReplyRule[]): Promise<void> {
    if (!thread.text) return

    const threadText = thread.text.toLowerCase()

    for (const rule of rules) {
      // Check if any trigger keywords match
      const hasMatchingKeyword = rule.trigger_keywords.some((keyword) => threadText.includes(keyword.toLowerCase()))

      if (!hasMatchingKeyword) continue

      // Check if we already replied to this thread
      const { data: existingReply } = await (await this.supabase)
        .from("reply_history")
        .select("id")
        .eq("original_post_id", thread.id)
        .eq("auto_reply_rule_id", rule.id)
        .single()

      if (existingReply) {
        console.log(`[v0] Already replied to thread ${thread.id} with rule ${rule.name}`)
        continue
      }

      // Check daily limits
      const canReply = await this.replyProcessor.checkDailyLimits(rule.user_id, rule.id)
      if (!canReply) {
        console.log(`[v0] Daily limit reached for rule ${rule.name}`)
        continue
      }

      // Schedule the reply
      await this.scheduleReply(thread, rule)
    }
  }

  private async scheduleReply(thread: any, rule: AutoReplyRule): Promise<void> {
    try {
      // Determine reply content
      const replyContent = rule.reply_template?.content || rule.custom_reply_text || "Thanks for your message!"

      // Calculate scheduled time
      const scheduledFor = new Date()
      scheduledFor.setMinutes(scheduledFor.getMinutes() + rule.delay_minutes)

      // Create reply history entry
      const { error } = await (await this.supabase).from("reply_history").insert({
        user_id: rule.user_id,
        threads_account_id: rule.threads_account_id,
        auto_reply_rule_id: rule.id,
        original_post_id: thread.id,
        original_post_content: thread.text,
        reply_content: replyContent,
        status: "pending",
        scheduled_for: scheduledFor.toISOString(),
      })

      if (error) {
        console.error(`[v0] Error scheduling reply:`, error)
        return
      }

      console.log(
        `[v0] Scheduled reply for thread ${thread.id} using rule ${rule.name} (delay: ${rule.delay_minutes}min)`,
      )
    } catch (error) {
      console.error(`[v0] Error scheduling reply:`, error)
    }
  }
}
