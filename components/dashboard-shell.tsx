import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader activePath="/dashboard" />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="mx-auto grid max-w-6xl gap-4">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
