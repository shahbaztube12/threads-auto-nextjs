import { NextResponse } from "next/server"
import { ReplyProcessor } from "@/lib/jobs/reply-processor"
import { ThreadsMonitor } from "@/lib/jobs/threads-monitor"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    console.log("[v0] Starting combined job: monitoring threads, processing replies, and cleanup")

    // First, monitor threads for new replies to schedule
    const monitor = new ThreadsMonitor()
    await monitor.monitorThreadsForReplies()

    // Then, process any pending replies
    const processor = new ReplyProcessor()
    await processor.processPendingReplies()

    // Finally, perform cleanup
    await performCleanup()

    return NextResponse.json({
      success: true,
      message: "Thread monitoring, reply processing, and cleanup completed",
    })
  } catch (error) {
    console.error("Combined job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Combined job failed",
      },
      { status: 500 },
    )
  }
}

async function performCleanup() {
  try {
    const supabase = await createClient()

    // Clean up old reply history (older than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { error: cleanupError } = await supabase
      .from("reply_history")
      .delete()
      .lt("created_at", thirtyDaysAgo.toISOString())
      .eq("status", "sent")

    if (cleanupError) {
      console.error("Cleanup error:", cleanupError)
    }

    // Mark very old pending replies as failed
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { error: failedError } = await supabase
      .from("reply_history")
      .update({
        status: "failed",
        error_message: "Reply expired - too old to process",
      })
      .eq("status", "pending")
      .lt("scheduled_for", oneDayAgo.toISOString())

    if (failedError) {
      console.error("Failed update error:", failedError)
    }

    console.log("Cleanup completed successfully")
  } catch (error) {
    console.error("Cleanup failed:", error)
  }
}

// Allow GET for easier testing
export async function GET() {
  return POST()
}
