"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/app/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AutoReplyRule {
  id: string
  name: string
  trigger_keywords: string[]
  reply_template_id: string | null
  custom_reply_text: string | null
  delay_minutes: number
  max_replies_per_day: number
  is_active: boolean
  threads_account_id: string
  created_at: string
}

interface ReplyTemplate {
  id: string
  name: string
  content: string
}

interface ThreadsAccount {
  id: string
  username: string
}

export default function RulesPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([])
  const [templates, setTemplates] = useState<ReplyTemplate[]>([])
  const [accounts, setAccounts] = useState<ThreadsAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rulesRes, templatesRes, accountsRes] = await Promise.all([
        fetch("/api/rules"),
        fetch("/api/templates"),
        fetch("/api/threads/accounts"),
      ])

      const [rulesData, templatesData, accountsData] = await Promise.all([
        rulesRes.json(),
        templatesRes.json(),
        accountsRes.json(),
      ])

      setRules(rulesData.rules || [])
      setTemplates(templatesData.templates || [])
      setAccounts(accountsData.accounts || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRule = async (formData: FormData) => {
    try {
      const keywords = (formData.get("keywords") as string)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)

      const response = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          trigger_keywords: keywords,
          reply_template_id: formData.get("template") || null,
          custom_reply_text: formData.get("custom_text") || null,
          delay_minutes: Number.parseInt(formData.get("delay") as string) || 0,
          max_replies_per_day: Number.parseInt(formData.get("max_replies") as string) || 50,
          threads_account_id: formData.get("account"),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Auto-reply rule created successfully",
        })
        setShowCreateDialog(false)
        fetchData()
      } else {
        throw new Error("Failed to create rule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create rule",
        variant: "destructive",
      })
    }
  }

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/rules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          is_active: !isActive,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Rule ${!isActive ? "activated" : "deactivated"} successfully`,
        })
        fetchData()
      } else {
        throw new Error("Failed to toggle rule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle rule",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch("/api/rules", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rule deleted successfully",
        })
        fetchData()
      } else {
        throw new Error("Failed to delete rule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DashboardHeader
        title="Auto-Reply Rules"
        description="Create and manage rules for automated replies to your Threads"
        action={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button disabled={accounts.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Auto-Reply Rule</DialogTitle>
                <DialogDescription>Set up automated replies based on keywords and triggers</DialogDescription>
              </DialogHeader>
              <form action={handleCreateRule} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Rule Name</Label>
                    <Input id="name" name="name" placeholder="e.g., Welcome New Followers" required />
                  </div>
                  <div>
                    <Label htmlFor="account">Threads Account</Label>
                    <Select name="account" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            @{account.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="keywords">Trigger Keywords</Label>
                  <Input id="keywords" name="keywords" placeholder="hello, hi, thanks (comma separated)" required />
                </div>

                <div>
                  <Label htmlFor="template">Reply Template (Optional)</Label>
                  <Select name="template">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template or use custom text" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="custom_text">Custom Reply Text (if no template selected)</Label>
                  <Input id="custom_text" name="custom_text" placeholder="Thanks for your message!" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delay">Delay (minutes)</Label>
                    <Input id="delay" name="delay" type="number" min="0" defaultValue="0" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="max_replies">Max Replies Per Day</Label>
                    <Input
                      id="max_replies"
                      name="max_replies"
                      type="number"
                      min="1"
                      defaultValue="50"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Rule</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-8">Loading rules...</div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Threads Accounts Connected</CardTitle>
              <CardDescription>Connect a Threads account first to create auto-reply rules</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/dashboard/accounts">Connect Threads Account</a>
              </Button>
            </CardContent>
          </Card>
        ) : rules.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Auto-Reply Rules</CardTitle>
              <CardDescription>Create your first auto-reply rule to start automating responses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowCreateDialog(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rules.map((rule) => {
              const account = accounts.find((acc) => acc.id === rule.threads_account_id)
              const template = templates.find((tpl) => tpl.id === rule.reply_template_id)

              return (
                <Card key={rule.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base font-medium">{rule.name}</CardTitle>
                      <CardDescription>@{account?.username || "Unknown Account"}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleRule(rule.id, rule.is_active)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Keywords: </span>
                        <span className="text-sm text-muted-foreground">{rule.trigger_keywords.join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Reply: </span>
                        <span className="text-sm text-muted-foreground">
                          {template ? template.name : rule.custom_reply_text}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Delay: {rule.delay_minutes}min</span>
                        <span>Max/day: {rule.max_replies_per_day}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
