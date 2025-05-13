import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSessionDuration } from "@/lib/session-analysis"
import type { SessionAnalysisResult } from "@/lib/session-analysis"
import { Clock, Calendar, PlayCircle, Zap } from "lucide-react"

interface SessionStatsProps {
  sessionAnalysis: SessionAnalysisResult
}

export function SessionStats({ sessionAnalysis }: SessionStatsProps) {
  const {
    totalSessions,
    averageSessionDuration,
    longestSession,
    mostVideosSession,
    mostCommonStartHour,
    mostCommonDay,
    averageVideosPerSession,
  } = sessionAnalysis

  // Format the most common start hour
  const formattedHour = new Date(0, 0, 0, mostCommonStartHour).toLocaleTimeString([], {
    hour: "numeric",
    hour12: true,
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Watching Sessions</CardTitle>
          <PlayCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Continuous viewing periods with at least 2 videos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Session Length</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatSessionDuration(averageSessionDuration)}</div>
          <p className="text-xs text-muted-foreground">
            {averageVideosPerSession.toFixed(1)} videos per session on average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Session</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatSessionDuration(longestSession.duration)}</div>
          <p className="text-xs text-muted-foreground">{longestSession.videos.length} videos in one session</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Common Time</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostCommonDay}, {formattedHour}
          </div>
          <p className="text-xs text-muted-foreground">When you typically start watching sessions</p>
        </CardContent>
      </Card>
    </div>
  )
}
