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
    const { data: accounts, error } = await supabase
      .from("threads_accounts")
      .select("id, threads_user_id, username, is_active, created_at, token_expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Failed to fetch accounts:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch accounts",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { accountId } = await request.json()

    if (!accountId) {
      return NextResponse.json({ error: "Account ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("threads_accounts")
      .update({ is_active: false })
      .eq("id", accountId)
      .eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to disconnect account:", error)
    return NextResponse.json(
      {
        error: "Failed to disconnect account",
      },
      { status: 500 },
    )
  }
}
