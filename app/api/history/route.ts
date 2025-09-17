import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("reply_history")
      .select(`
        *,
        threads_accounts!inner(username),
        auto_reply_rules(name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: history, error } = await query

    if (error) throw error

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Failed to fetch history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
