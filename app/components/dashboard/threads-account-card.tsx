"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ThreadsAccount {
  id: string
  threads_user_id: string
  username: string
  is_active: boolean
  created_at: string
  token_expires_at: string
}

interface ThreadsAccountCardProps {
  account: ThreadsAccount
  onDisconnect: (accountId: string) => void
}

export function ThreadsAccountCard({ account, onDisconnect }: ThreadsAccountCardProps) {
  const expiresAt = new Date(account.token_expires_at)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysUntilExpiry <= 7

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">@{account.username}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`https://threads.net/@${account.username}`, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDisconnect(account.id)} className="text-red-600">
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant={account.is_active ? "default" : "secondary"}>
            {account.is_active ? "Active" : "Inactive"}
          </Badge>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Token expires in {daysUntilExpiry} days</p>
            {isExpiringSoon && (
              <Badge variant="destructive" className="mt-1">
                Expires Soon
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
