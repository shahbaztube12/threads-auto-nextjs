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
    const { data: templates, error } = await supabase
      .from("reply_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Failed to fetch templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
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
    const { name, content } = await request.json()

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
    }

    const { data: template, error } = await supabase
      .from("reply_templates")
      .insert({
        user_id: user.id,
        name,
        content,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Failed to create template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
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
    const { id, name, content } = await request.json()

    if (!id || !name || !content) {
      return NextResponse.json({ error: "ID, name and content are required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("reply_templates")
      .update({ name, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update template:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
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
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("reply_templates").delete().eq("id", id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete template:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
