"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [jobStatus, setJobStatus] = useState<Record<string, "idle" | "running">>({
    "process-replies": "idle",
    "monitor-threads": "idle",
    cleanup: "idle",
  })
  const { toast } = useToast()

  const runJob = async (jobName: string) => {
    setJobStatus((prev) => ({ ...prev, [jobName]: "running" }))

    try {
      const response = await fetch(`/api/jobs/${jobName}`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || `${jobName} completed successfully`,
        })
      } else {
        throw new Error(data.error || "Job failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Job failed",
        variant: "destructive",
      })
    } finally {
      setJobStatus((prev) => ({ ...prev, [jobName]: "idle" }))
    }
  }

  const jobs = [
    {
      name: "process-replies",
      title: "Process Pending Replies",
      description: "Send all scheduled replies that are due",
      icon: "📤",
    },
    {
      name: "monitor-threads",
      title: "Monitor Threads",
      description: "Check for new threads that match auto-reply rules",
      icon: "👀",
    },
    {
      name: "cleanup",
      title: "Cleanup Old Data",
      description: "Remove old reply history and mark expired replies as failed",
      icon: "🧹",
    },
  ]

  return (
    <>
      <DashboardHeader title="Settings & Jobs" description="Manage background jobs and system settings" />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Background Jobs</CardTitle>
              <CardDescription>
                Manually trigger background jobs for testing and maintenance. In production, these would run
                automatically via cron jobs or scheduled tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <Card key={job.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <span className="text-lg">{job.icon}</span>
                        {job.title}
                      </CardTitle>
                      <Badge variant={jobStatus[job.name] === "running" ? "default" : "secondary"}>
                        {jobStatus[job.name] === "running" ? "Running" : "Idle"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                      <Button
                        onClick={() => runJob(job.name)}
                        disabled={jobStatus[job.name] === "running"}
                        className="w-full"
                        size="sm"
                      >
                        {jobStatus[job.name] === "running" ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Job
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Setup</CardTitle>
              <CardDescription>
                For production deployment, set up these background jobs to run automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Recommended Cron Schedule:</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div>
                      <span className="text-blue-600">*/5 * * * *</span> - Process pending replies (every 5 minutes)
                    </div>
                    <div>
                      <span className="text-blue-600">*/10 * * * *</span> - Monitor threads (every 10 minutes)
                    </div>
                    <div>
                      <span className="text-blue-600">0 2 * * *</span> - Cleanup old data (daily at 2 AM)
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Vercel Cron Functions:</h4>
                  <p className="text-sm text-muted-foreground">
                    Deploy these API routes as Vercel Cron Functions for automatic execution. Add the cron configuration
                    to your vercel.json file.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
