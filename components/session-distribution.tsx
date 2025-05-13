"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { SessionAnalysisResult } from "@/lib/session-analysis"

interface SessionDistributionProps {
  sessionAnalysis: SessionAnalysisResult
}

export function SessionDistribution({ sessionAnalysis }: SessionDistributionProps) {
  const [view, setView] = useState<"hour" | "day">("hour")
  const { sessionsPerHour, sessionsPerDay } = sessionAnalysis

  // Prepare data for charts
  const hourData = Object.entries(sessionsPerHour)
    .map(([hour, count]) => ({ name: hour, count }))
    .sort((a, b) => {
      const hourA = Number.parseInt(a.name.split(":")[0])
      const hourB = Number.parseInt(b.name.split(":")[0])
      return hourA - hourB
    })

  // Order days of week from Sunday to Saturday
  const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayData = daysOrder
    .map((day) => ({ name: day, count: sessionsPerDay[day] || 0 }))
    .filter((item) => item.count > 0)

  const data = view === "hour" ? hourData : dayData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Distribution</CardTitle>
        <CardDescription>When you typically watch YouTube</CardDescription>
        <Tabs defaultValue="hour" className="w-full" onValueChange={(value) => setView(value as "hour" | "day")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hour">By Hour</TabsTrigger>
            <TabsTrigger value="day">By Day</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => [`${value} sessions`, "Count"]}
              labelFormatter={(label) => (view === "hour" ? `At ${label}` : label)}
            />
            <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
