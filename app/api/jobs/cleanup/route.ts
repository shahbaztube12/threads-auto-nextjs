import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
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

    return NextResponse.json({ success: true, message: "Cleanup completed" })
  } catch (error) {
    console.error("Cleanup job failed:", error)
    return NextResponse.json({ success: false, error: "Cleanup failed" }, { status: 500 })
  }
}

// Allow GET for easier testing
export async function GET() {
  return POST()
}
