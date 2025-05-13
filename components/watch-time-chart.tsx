"use client"

import { useEffect, useState } from "react"
import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface WatchTimeChartProps {
  watchHistory: ParsedWatchHistory
  showDaily?: boolean
}

export function WatchTimeChart({ watchHistory, showDaily = false }: WatchTimeChartProps) {
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    if (showDaily) {
      // Process daily data
      let dailyData: { name: string; count: number }[] = []

      if (watchHistory.watchTimeByDay instanceof Map) {
        // If it's a proper Map
        dailyData = Array.from(watchHistory.watchTimeByDay.entries()).map(([date, count]) => ({ name: date, count }))
      } else if (watchHistory.watchTimeByDay && typeof watchHistory.watchTimeByDay === "object") {
        // If it's an object (serialized Map)
        dailyData = Object.entries(watchHistory.watchTimeByDay).map(([date, count]) => ({
          name: date,
          count: count as number,
        }))
      }

      // Sort by date
      dailyData.sort((a, b) => a.name.localeCompare(b.name))
      setChartData(dailyData)
    } else {
      // Process monthly data
      let monthlyData: { name: string; count: number; originalName: string }[] = []

      if (watchHistory.watchTimeByMonth instanceof Map) {
        // If it's a proper Map
        monthlyData = Array.from(watchHistory.watchTimeByMonth.entries()).map(([month, count]) => {
          // Format month for display (YYYY-MM to MMM YYYY)
          const [year, monthNum] = month.split("-")
          const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1, 1)
          const formattedMonth = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

          return { name: formattedMonth, count, originalName: month }
        })
      } else if (watchHistory.watchTimeByMonth && typeof watchHistory.watchTimeByMonth === "object") {
        // If it's an object (serialized Map)
        monthlyData = Object.entries(watchHistory.watchTimeByMonth).map(([month, count]) => {
          // Format month for display (YYYY-MM to MMM YYYY)
          const [year, monthNum] = month.split("-")
          const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1, 1)
          const formattedMonth = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

          return { name: formattedMonth, count: count as number, originalName: month }
        })
      }

      // Sort by date
      monthlyData.sort((a, b) => a.originalName.localeCompare(b.originalName))
      setChartData(monthlyData)
    }
  }, [watchHistory, showDaily])

  if (chartData.length === 0) {
    return <div className="flex h-full items-center justify-center">Loading chart data...</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip formatter={(value: number) => [`${value} videos`, "Watched"]} labelFormatter={(label) => `${label}`} />
        <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
