"use client"

import { useState, useEffect } from "react"
import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface TimeOfDayAnalysisProps {
  watchHistory: ParsedWatchHistory
}

export function TimeOfDayAnalysis({ watchHistory }: TimeOfDayAnalysisProps) {
  const [timeData, setTimeData] = useState<{ hour: string; count: number }[]>([])

  useEffect(() => {
    if (!watchHistory || !watchHistory.items || !Array.isArray(watchHistory.items)) return

    // Initialize hours array with all 24 hours
    const hourCounts = Array(24)
      .fill(0)
      .map((_, i) => ({
        hour: i.toString().padStart(2, "0"),
        count: 0,
      }))

    // Count videos watched by hour of day
    watchHistory.items.forEach((item) => {
      try {
        const date = new Date(item.time)
        if (!isNaN(date.getTime())) {
          const hour = date.getHours()
          hourCounts[hour].count++
        }
      } catch (e) {
        // Skip invalid dates
      }
    })

    // Format hour labels for display
    const formattedData = hourCounts.map((item) => ({
      hour: `${item.hour}:00`,
      count: item.count,
    }))

    setTimeData(formattedData)
  }, [watchHistory])

  if (timeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watching Time of Day</CardTitle>
          <CardDescription>When you typically watch YouTube videos</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watching Time of Day</CardTitle>
        <CardDescription>When you typically watch YouTube videos</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timeData}>
            <XAxis
              dataKey="hour"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={3} // Show every 4th hour label to avoid crowding
            />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => [`${value} videos`, "Watched"]}
              labelFormatter={(label) => `At ${label}`}
            />
            <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
