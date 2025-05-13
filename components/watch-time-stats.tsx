import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"

interface WatchTimeStatsProps {
  watchHistory: ParsedWatchHistory
}

export function WatchTimeStats({ watchHistory }: WatchTimeStatsProps) {
  // Calculate total watch time
  let totalWatchTimeSeconds = 0
  let videosWithDuration = 0

  if (watchHistory && watchHistory.items && Array.isArray(watchHistory.items)) {
    watchHistory.items.forEach((item) => {
      if (item.videoDetails?.durationSeconds) {
        totalWatchTimeSeconds += item.videoDetails.durationSeconds
        videosWithDuration++
      }
    })
  }

  // If we have videos with duration, estimate total watch time for all videos
  let estimatedTotalWatchTimeSeconds = totalWatchTimeSeconds
  if (videosWithDuration > 0 && watchHistory.totalVideos) {
    const averageDuration = totalWatchTimeSeconds / videosWithDuration
    estimatedTotalWatchTimeSeconds = averageDuration * watchHistory.totalVideos
  }

  // Format watch time
  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} days, ${hours % 24} hours`
    } else {
      return `${hours} hours`
    }
  }

  // Calculate average watch time per day
  let avgWatchTimePerDay = 0
  let daysDiff = 1

  if (watchHistory && watchHistory.items && Array.isArray(watchHistory.items) && watchHistory.items.length > 0) {
    const dates = watchHistory.items.map((item) => new Date(item.time))
    const validDates = dates.filter((d) => !isNaN(d.getTime()))

    if (validDates.length > 0) {
      const oldestDate = new Date(Math.min(...validDates.map((d) => d.getTime())))
      const newestDate = new Date(Math.max(...validDates.map((d) => d.getTime())))
      daysDiff = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) || 1
    }
  }

  avgWatchTimePerDay = estimatedTotalWatchTimeSeconds / daysDiff / 3600 // in hours

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watch Time Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Total Watch Time (Estimated)</span>
            </div>
            <p className="text-2xl font-bold">{formatWatchTime(estimatedTotalWatchTimeSeconds)}</p>
            <p className="text-sm text-muted-foreground">Based on {videosWithDuration} videos with duration data</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Average Daily Watch Time</span>
            </div>
            <p className="text-2xl font-bold">{avgWatchTimePerDay.toFixed(1)} hours</p>
            <p className="text-sm text-muted-foreground">Over {daysDiff} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
