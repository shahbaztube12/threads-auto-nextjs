import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch dashboard stats
  const [accountsResult, rulesResult, historyResult, templatesResult] = await Promise.all([
    supabase.from("threads_accounts").select("id, is_active").eq("user_id", user!.id),
    supabase.from("auto_reply_rules").select("id, is_active").eq("user_id", user!.id),
    supabase
      .from("reply_history")
      .select("id, created_at, status")
      .eq("user_id", user!.id)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("reply_templates").select("id").eq("user_id", user!.id),
  ])

  const accounts = accountsResult.data || []
  const rules = rulesResult.data || []
  const todayReplies = historyResult.data || []
  const templates = templatesResult.data || []

  const activeAccounts = accounts.filter((acc) => acc.is_active).length
  const activeRules = rules.filter((rule) => rule.is_active).length
  const successfulReplies = todayReplies.filter((reply) => reply.status === "sent").length
  const failedReplies = todayReplies.filter((reply) => reply.status === "failed").length

  const successRate = todayReplies.length > 0 ? Math.round((successfulReplies / todayReplies.length) * 100) : 0
  const yesterdayReplies = 15 // Mock data - would come from API
  const replyTrend =
    yesterdayReplies > 0 ? Math.round(((successfulReplies - yesterdayReplies) / yesterdayReplies) * 100) : 0

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description={`Welcome back, ${user!.email?.split("@")[0]}! Here's your automation overview.`}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Connected Accounts"
            value={activeAccounts}
            description="Active Threads accounts"
            icon={
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
            }
          />
          <StatsCard
            title="Active Rules"
            value={activeRules}
            description="Auto-reply rules running"
            icon={
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            }
          />
          <StatsCard
            title="Replies Today"
            value={successfulReplies}
            description="Automated replies sent"
            trend={{
              value: replyTrend,
              label: "from yesterday",
              positive: replyTrend >= 0,
            }}
            icon={
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            }
          />
          <StatsCard
            title="Success Rate"
            value={`${successRate}%`}
            description="Replies delivered successfully"
            trend={{
              value: 5,
              label: "improvement",
              positive: true,
            }}
            icon={
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Quick Actions
              </CardTitle>
              <CardDescription>Get started with automating your Threads engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAccounts === 0 ? (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/dashboard/accounts">Connect Threads Account</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/accounts">Manage Accounts ({activeAccounts})</Link>
                </Button>
              )}

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/templates">Create Template ({templates.length} existing)</Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/rules">Setup Auto-Reply ({activeRules} active)</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Your automation performance at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Reply Success Rate</span>
                  <span className="font-medium">{successRate}%</span>
                </div>
                <Progress value={successRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Successful</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{successfulReplies}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{failedReplies}</div>
                </div>
              </div>

              {todayReplies.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most active time</span>
                    <Badge variant="secondary">2:00 PM - 4:00 PM</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityFeed />

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of your automation systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-100">All Systems Operational</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Auto-replies are running smoothly</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Online</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Rate Limit</span>
                  <span className="text-sm font-medium">85% remaining</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily Reply Quota</span>
                  <span className="text-sm font-medium">{successfulReplies}/100 used</span>
                </div>
                <Progress value={(successfulReplies / 100) * 100} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Detailed Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
