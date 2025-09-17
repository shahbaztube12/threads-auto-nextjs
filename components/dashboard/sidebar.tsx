"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: "📊" },
  { name: "Accounts", href: "/dashboard/accounts", icon: "🔗" },
  { name: "Templates", href: "/dashboard/templates", icon: "📝" },
  { name: "Rules", href: "/dashboard/rules", icon: "⚙️" },
  { name: "History", href: "/dashboard/history", icon: "📈" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Threads Auto Reply</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button onClick={handleSignOut} variant="outline" className="w-full bg-transparent">
          Sign Out
        </Button>
      </div>
    </div>
  )
}
