import { NextResponse } from "next/server"
import { ReplyProcessor } from "@/lib/jobs/reply-processor"
import { ThreadsMonitor } from "@/lib/jobs/threads-monitor"

export async function POST() {
  try {
    console.log("[v0] Starting combined job: monitoring threads and processing replies")

    // First, monitor threads for new replies to schedule
    const monitor = new ThreadsMonitor()
    await monitor.monitorThreadsForReplies()

    // Then, process any pending replies
    const processor = new ReplyProcessor()
    await processor.processPendingReplies()

    return NextResponse.json({
      success: true,
      message: "Thread monitoring and reply processing completed",
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

// Allow GET for easier testing
export async function GET() {
  return POST()
}
