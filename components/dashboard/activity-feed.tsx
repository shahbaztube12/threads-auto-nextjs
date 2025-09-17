"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "reply_sent" | "rule_triggered" | "account_connected" | "template_used"
  message: string
  timestamp: Date
  status: "success" | "warning" | "error"
  metadata?: {
    threadId?: string
    templateName?: string
    ruleName?: string
  }
}

// Mock data - in real app this would come from API
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "reply_sent",
    message: "Auto-reply sent to @johndoe",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: "success",
    metadata: { threadId: "thread_123", templateName: "Welcome Message" },
  },
  {
    id: "2",
    type: "rule_triggered",
    message: 'Keyword rule "support" triggered',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: "success",
    metadata: { ruleName: "Support Inquiries" },
  },
  {
    id: "3",
    type: "template_used",
    message: 'Template "Thank You" used 3 times',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: "success",
    metadata: { templateName: "Thank You" },
  },
  {
    id: "4",
    type: "reply_sent",
    message: "Failed to send reply - rate limit exceeded",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: "error",
  },
  {
    id: "5",
    type: "account_connected",
    message: "New Threads account connected",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "success",
  },
]

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "reply_sent":
      return (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
      )
    case "rule_triggered":
      return (
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )
    case "template_used":
      return (
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      )
    case "account_connected":
      return (
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-orange-600 dark:text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
      )
  }
}

const getStatusBadge = (status: ActivityItem["status"]) => {
  switch (status) {
    case "success":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Success
        </Badge>
      )
    case "warning":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Warning
        </Badge>
      )
    case "error":
      return <Badge variant="destructive">Error</Badge>
  }
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.message}</p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                  {activity.metadata && (
                    <div className="flex gap-2 mt-2">
                      {activity.metadata.templateName && (
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata.templateName}
                        </Badge>
                      )}
                      {activity.metadata.ruleName && (
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata.ruleName}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
