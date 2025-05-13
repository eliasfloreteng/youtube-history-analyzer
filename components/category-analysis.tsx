"use client"

import { useState, useEffect } from "react"
import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CategoryAnalysisProps {
  watchHistory: ParsedWatchHistory
}

interface CategoryData {
  name: string
  value: number
  count: number
}

export function CategoryAnalysis({ watchHistory }: CategoryAnalysisProps) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [viewType, setViewType] = useState<"count" | "duration">("count")

  useEffect(() => {
    if (!watchHistory) return

    const categoryMap = new Map<string, { count: number; duration: number }>()

    // Process each video with category information
    watchHistory.items.forEach((item) => {
      if (item.videoDetails?.categoryName) {
        const categoryName = item.videoDetails.categoryName
        const duration = item.videoDetails.durationSeconds || 0

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { count: 0, duration: 0 })
        }

        const current = categoryMap.get(categoryName)!
        categoryMap.set(categoryName, {
          count: current.count + 1,
          duration: current.duration + duration,
        })
      }
    })

    // Convert map to array and sort
    const sortedData = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        value: viewType === "count" ? data.count : data.duration,
        count: data.count,
        duration: data.duration,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 categories

    setCategoryData(sortedData)
  }, [watchHistory, viewType])

  // If no category data is available
  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Categories</CardTitle>
          <CardDescription>
            Connect your YouTube account and fetch video details to see category analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No category data available</p>
        </CardContent>
      </Card>
    )
  }

  // Colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ]

  const handleViewChange = (value: string) => {
    setViewType(value as "count" | "duration")
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Categories</CardTitle>
        <CardDescription>Analysis of your watched video categories</CardDescription>
        <Tabs defaultValue="count" className="w-full" onValueChange={handleViewChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="count">By Count</TabsTrigger>
            <TabsTrigger value="duration">By Duration</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    if (viewType === "duration") {
                      return [formatDuration(value as number), name]
                    }
                    return [value, name]
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate">{category.name}</span>
                  <span className="text-muted-foreground">
                    {viewType === "count" ? `${category.count} videos` : formatDuration(category.duration)}
                  </span>
                </div>
                <Progress
                  value={(category.value / categoryData[0].value) * 100}
                  className="h-2"
                  indicatorClassName={`bg-[${COLORS[index % COLORS.length]}]`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
