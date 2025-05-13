"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatSessionDuration, formatTimeOfDay, formatDate } from "@/lib/session-analysis"
import type { WatchSession } from "@/lib/session-analysis"
import { ChevronDown, ChevronUp, Clock, Calendar, PlayCircle } from "lucide-react"

interface SessionListProps {
  sessions: WatchSession[]
  limit?: number
}

export function SessionList({ sessions, limit = 5 }: SessionListProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  // Sort sessions by duration (longest first)
  const sortedSessions = [...sessions].sort((a, b) => b.duration - a.duration)

  // Limit the number of sessions shown
  const displayedSessions = showAll ? sortedSessions : sortedSessions.slice(0, limit)

  const toggleSession = (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null)
    } else {
      setExpandedSession(sessionId)
    }
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watching Sessions</CardTitle>
          <CardDescription>Your longest continuous watching sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No watching sessions found. Try adjusting the session detection settings.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watching Sessions</CardTitle>
        <CardDescription>Your longest continuous watching sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedSessions.map((session) => (
            <div key={session.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSession(session.id)}
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {formatDate(new Date(session.startTime))} • {formatTimeOfDay(new Date(session.startTime))} to{" "}
                    {formatTimeOfDay(new Date(session.endTime))}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatSessionDuration(session.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3 w-3" />
                      {session.videos.length} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {Object.keys(session.channelCounts).length} channels
                    </span>
                  </div>
                </div>
                {expandedSession === session.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {expandedSession === session.id && (
                <div className="p-4 border-t bg-muted/20">
                  <h4 className="font-medium mb-2">Videos in this session:</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {session.videos.map((video, index) => {
                      // Extract video title (remove "Watched " prefix)
                      const title = video.title.startsWith("Watched ") ? video.title.substring(8) : video.title

                      // Get channel name
                      const channelName = video.subtitles?.[0]?.name || "Unknown Channel"

                      return (
                        <div key={index} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                          <div className="flex-shrink-0 w-24 h-14 bg-muted rounded overflow-hidden">
                            {video.videoDetails?.thumbnail ? (
                              <img
                                src={video.videoDetails.thumbnail || "/placeholder.svg"}
                                alt={title}
                                className="w-full h-full object-cover"
                              />
                            ) : video.videoId ? (
                              <img
                                src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
                                alt={title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <span className="text-xs text-muted-foreground">No thumbnail</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={video.titleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline line-clamp-2"
                            >
                              {title}
                            </a>
                            <div className="text-xs text-muted-foreground mt-1">{channelName}</div>
                            {video.videoDetails?.duration && (
                              <div className="text-xs text-muted-foreground mt-1">{video.videoDetails.duration}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {Object.keys(session.channelCounts).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Channels:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(session.channelCounts)
                          .sort(([, countA], [, countB]) => countB - countA)
                          .map(([channel, count]) => (
                            <span
                              key={channel}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10"
                            >
                              {channel} ({count})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(session.categoryCounts).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Categories:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(session.categoryCounts)
                          .sort(([, countA], [, countB]) => countB - countA)
                          .map(([category, count]) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/20"
                            >
                              {category} ({count})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {sessions.length > limit && (
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Show All (${sessions.length})`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
