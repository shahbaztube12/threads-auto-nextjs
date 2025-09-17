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
    const { data: rules, error } = await supabase
      .from("auto_reply_rules")
      .select(`
        *,
        threads_accounts!inner(username),
        reply_templates(name, content)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Failed to fetch rules:", error)
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const {
      name,
      trigger_keywords,
      reply_template_id,
      custom_reply_text,
      delay_minutes,
      max_replies_per_day,
      threads_account_id,
    } = await request.json()

    if (!name || !trigger_keywords || !threads_account_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!reply_template_id && !custom_reply_text) {
      return NextResponse.json({ error: "Either template or custom text is required" }, { status: 400 })
    }

    const { data: rule, error } = await supabase
      .from("auto_reply_rules")
      .insert({
        user_id: user.id,
        name,
        trigger_keywords,
        reply_template_id: reply_template_id || null,
        custom_reply_text: custom_reply_text || null,
        delay_minutes: delay_minutes || 0,
        max_replies_per_day: max_replies_per_day || 50,
        threads_account_id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ rule })
  } catch (error) {
    console.error("Failed to create rule:", error)
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, is_active } = await request.json()

    if (!id || is_active === undefined) {
      return NextResponse.json({ error: "ID and is_active are required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("auto_reply_rules")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update rule:", error)
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 })
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
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("auto_reply_rules").delete().eq("id", id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete rule:", error)
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 })
  }
}
