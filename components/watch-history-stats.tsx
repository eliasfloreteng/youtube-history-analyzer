import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, PlayCircle, Users } from "lucide-react"

interface WatchHistoryStatsProps {
  watchHistory: ParsedWatchHistory
}

export function WatchHistoryStats({ watchHistory }: WatchHistoryStatsProps) {
  // Safely access properties with fallbacks
  const totalVideos = watchHistory.totalVideos || 0

  // Handle the case where uniqueChannels might be undefined or not a Map
  let uniqueChannelsCount = 0
  if (watchHistory.uniqueChannels instanceof Map) {
    uniqueChannelsCount = watchHistory.uniqueChannels.size
  } else if (watchHistory.uniqueChannels && typeof watchHistory.uniqueChannels === "object") {
    // If it's an object (serialized Map), count the keys
    uniqueChannelsCount = Object.keys(watchHistory.uniqueChannels).length
  }

  // Calculate date range safely
  const dates = watchHistory.items.map((item) => new Date(item.time))
  const validDates = dates.filter((d) => !isNaN(d.getTime()))

  let oldestDate = new Date()
  let newestDate = new Date(0)
  let daysDiff = 0

  if (validDates.length > 0) {
    oldestDate = new Date(Math.min(...validDates.map((d) => d.getTime())))
    newestDate = new Date(Math.max(...validDates.map((d) => d.getTime())))
    daysDiff = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) || 1
  }

  // Calculate average videos per day
  const avgVideosPerDay = totalVideos / (daysDiff || 1)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Videos Watched</CardTitle>
          <PlayCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVideos.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            From {oldestDate.toLocaleDateString()} to {newestDate.toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Channels</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueChannelsCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {totalVideos > 0
              ? `${((uniqueChannelsCount / totalVideos) * 100).toFixed(1)}% channel diversity`
              : "No videos analyzed"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Per Day</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgVideosPerDay.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Videos watched on average per day</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Period</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{daysDiff} days</div>
          <p className="text-xs text-muted-foreground">
            {Math.floor(daysDiff / 30)} months, {daysDiff % 30} days
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
