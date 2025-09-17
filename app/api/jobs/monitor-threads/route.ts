import { NextResponse } from "next/server"
import { ThreadsMonitor } from "@/lib/jobs/threads-monitor"

export async function POST() {
  try {
    const monitor = new ThreadsMonitor()
    await monitor.monitorThreadsForReplies()

    return NextResponse.json({ success: true, message: "Threads monitoring completed" })
  } catch (error) {
    console.error("Threads monitoring job failed:", error)
    return NextResponse.json({ success: false, error: "Threads monitoring failed" }, { status: 500 })
  }
}

// Allow GET for easier testing
export async function GET() {
  return POST()
}
