"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReplyHistory {
  id: string
  original_post_id: string
  original_post_content: string | null
  reply_post_id: string | null
  reply_content: string
  status: string
  error_message: string | null
  scheduled_for: string | null
  sent_at: string | null
  created_at: string
  threads_account: {
    username: string
  }
  auto_reply_rule: {
    name: string
  } | null
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ReplyHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchHistory()
  }, [filter])

  const fetchHistory = async () => {
    try {
      const url = new URL("/api/history", window.location.origin)
      if (filter !== "all") {
        url.searchParams.set("status", filter)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (response.ok) {
        setHistory(data.history)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reply history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <DashboardHeader
        title="Reply History"
        description="View all automated replies and their status"
        action={
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchHistory}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-8">Loading reply history...</div>
        ) : history.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Reply History</CardTitle>
              <CardDescription>
                {filter === "all"
                  ? "No automated replies have been sent yet"
                  : `No replies with status "${filter}" found`}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((reply) => (
              <Card key={reply.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base font-medium">Reply to @{reply.threads_account.username}</CardTitle>
                    <CardDescription>
                      {reply.auto_reply_rule?.name || "Manual Reply"} • {formatDate(reply.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(reply.status)}>{reply.status}</Badge>
                    {reply.reply_post_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://threads.net/t/${reply.reply_post_id}`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reply.original_post_content && (
                      <div>
                        <span className="text-sm font-medium">Original Post:</span>
                        <p className="text-sm text-muted-foreground mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          {reply.original_post_content}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium">Reply:</span>
                      <p className="text-sm text-muted-foreground mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        {reply.reply_content}
                      </p>
                    </div>
                    {reply.error_message && (
                      <div>
                        <span className="text-sm font-medium text-red-600">Error:</span>
                        <p className="text-sm text-red-600 mt-1">{reply.error_message}</p>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {reply.scheduled_for && <span>Scheduled: {formatDate(reply.scheduled_for)}</span>}
                      {reply.sent_at && <span>Sent: {formatDate(reply.sent_at)}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
