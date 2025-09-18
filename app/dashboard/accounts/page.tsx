"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/app/components/dashboard/header"
import { ThreadsAccountCard } from "@/app/components/dashboard/threads-account-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ThreadsAccount {
  id: string
  threads_user_id: string
  username: string
  is_active: boolean
  created_at: string
  token_expires_at: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ThreadsAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      console.log("[v0] Fetching Threads accounts...")
      const response = await fetch("/api/threads/accounts")
      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Accounts fetched successfully:", data.accounts.length)
        setAccounts(data.accounts)
      } else {
        console.log("[v0] Failed to fetch accounts:", data.error)
        throw new Error(data.error)
      }
    } catch (error) {
      console.log("[v0] Error fetching accounts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnectAccount = () => {
    console.log("[v0] Connecting Threads account...")
    window.location.href = "/api/auth/threads"
  }

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      const response = await fetch("/api/threads/accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Account disconnected successfully",
        })
        fetchAccounts()
      } else {
        throw new Error("Failed to disconnect account")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DashboardHeader
        title="Connected Accounts"
        description="Manage your Threads accounts for automated replies"
        action={
          <Button onClick={handleConnectAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-8">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Accounts Connected</CardTitle>
              <CardDescription>Connect your first Threads account to start automating replies</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleConnectAccount} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Connect Threads Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <ThreadsAccountCard key={account.id} account={account} onDisconnect={handleDisconnectAccount} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
