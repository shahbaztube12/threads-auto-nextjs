import { DashboardHeader } from "@/components/dashboard/header"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader title="Analytics" description="Deep insights into your Threads automation performance" />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Engagement"
            value="2,847"
            description="Interactions generated"
            trend={{ value: 12, label: "vs last month", positive: true }}
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            }
          />
          <StatsCard
            title="Response Time"
            value="2.3s"
            description="Average reply speed"
            trend={{ value: 8, label: "faster", positive: true }}
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            }
          />
          <StatsCard
            title="Conversion Rate"
            value="18.5%"
            description="Replies to engagement"
            trend={{ value: 3, label: "increase", positive: true }}
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            }
          />
          <StatsCard
            title="Satisfaction"
            value="4.8/5"
            description="User feedback score"
            trend={{ value: 2, label: "improvement", positive: true }}
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            }
          />
        </div>

        <AnalyticsChart />

        <div className="grid gap-6 lg:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Templates</CardTitle>
              <CardDescription>Your most effective reply templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Welcome Message</div>
                  <div className="text-sm text-muted-foreground">Used 47 times</div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  94% success
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Thank You Reply</div>
                  <div className="text-sm text-muted-foreground">Used 32 times</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">89% success</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Support Response</div>
                  <div className="text-sm text-muted-foreground">Used 28 times</div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  92% success
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keyword Triggers</CardTitle>
              <CardDescription>Most active trigger words</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">help</span>
                <Badge variant="secondary">23 triggers</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">support</span>
                <Badge variant="secondary">18 triggers</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">question</span>
                <Badge variant="secondary">15 triggers</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">thanks</span>
                <Badge variant="secondary">12 triggers</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Tips</CardTitle>
              <CardDescription>Suggestions to improve performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Peak Hours</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Schedule more replies between 2-4 PM for 25% better engagement
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-medium text-green-900 dark:text-green-100 mb-1">Template Variety</div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Add 2-3 more templates to reduce repetition and improve authenticity
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
