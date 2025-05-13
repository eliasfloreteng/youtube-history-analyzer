import type { WatchHistoryItem } from "./parse-watch-history"

export interface WatchSession {
  id: string
  startTime: Date
  endTime: Date
  duration: number // in minutes
  videos: WatchHistoryItem[]
  channelCounts: Record<string, number>
  categoryCounts: Record<string, number>
  totalDurationSeconds: number
  averageVideoDuration: number // in seconds
}

// Update the SessionAnalysisResult interface to include totalWatchTimeHours
export interface SessionAnalysisResult {
  sessions: WatchSession[]
  totalSessions: number
  averageSessionDuration: number // in minutes
  longestSession: WatchSession
  mostVideosSession: WatchSession
  mostCommonStartHour: number
  mostCommonDay: string
  sessionsPerDay: Record<string, number>
  sessionsPerHour: Record<string, number>
  averageVideosPerSession: number
  totalWatchTimeHours: number // Add this new property
}

export interface SessionAnalysisOptions {
  // Maximum gap between videos to be considered part of the same session (in minutes)
  minVideosPerSession: number
}

const DEFAULT_OPTIONS: SessionAnalysisOptions = {
  maxGapMinutes: 30,
  minVideosPerSession: 2,
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function analyzeWatchSessions(
  watchHistory: WatchHistoryItem[],
  options: Partial<SessionAnalysisOptions> = {},
): SessionAnalysisResult {
  const { maxGapMinutes, minVideosPerSession } = { ...DEFAULT_OPTIONS, ...options }

  // Sort videos by time (oldest first to properly identify sessions)
  const sortedVideos = [...watchHistory].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  // Group videos into sessions
  const sessions: WatchSession[] = []
  let currentSession: WatchHistoryItem[] = []
  let lastVideoTime: Date | null = null

  // Process each video
  for (const video of sortedVideos) {
    const videoTime = new Date(video.time)

    // Check if this video should be part of the current session
    if (
      lastVideoTime &&
      currentSession.length > 0 &&
      (videoTime.getTime() - lastVideoTime.getTime()) / (1000 * 60) <= maxGapMinutes
    ) {
      // Add to current session
      currentSession.push(video)
    } else {
      // If we have a session with enough videos, save it
      if (currentSession.length >= minVideosPerSession) {
        const sessionData = createSessionData(currentSession)
        sessions.push(sessionData)
      }

      // Start a new session
      currentSession = [video]
    }

    lastVideoTime = videoTime
  }

  // Don't forget the last session
  if (currentSession.length >= minVideosPerSession) {
    const sessionData = createSessionData(currentSession)
    sessions.push(sessionData)
  }

  // If no sessions were found, return empty result
  if (sessions.length === 0) {
    return {
      sessions: [],
      totalSessions: 0,
      averageSessionDuration: 0,
      longestSession: {} as WatchSession,
      mostVideosSession: {} as WatchSession,
      mostCommonStartHour: 0,
      mostCommonDay: "",
      sessionsPerDay: {},
      sessionsPerHour: {},
      averageVideosPerSession: 0,
      totalWatchTimeHours: 0, // Add this new property
    }
  }

  // Calculate session statistics
  const totalSessions = sessions.length
  const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0)
  // In the analyzeWatchSessions function, add the calculation for totalWatchTimeHours
  // After calculating totalDuration, add:
  const totalWatchTimeHours = totalDuration / 60

  const totalVideos = sessions.reduce((sum, session) => sum + session.videos.length, 0)
  const averageVideosPerSession = totalVideos / totalSessions

  // Calculate average session duration
  const averageSessionDuration = totalDuration / totalSessions

  // Find longest session and session with most videos
  const longestSession = sessions.reduce((longest, current) =>
    current.duration > longest.duration ? current : longest,
  )
  const mostVideosSession = sessions.reduce((most, current) =>
    current.videos.length > most.videos.length ? current : most,
  )

  // Analyze session start times
  const startHours: Record<number, number> = {}
  const startDays: Record<string, number> = {}
  const sessionsPerHour: Record<string, number> = {}
  const sessionsPerDay: Record<string, number> = {}

  for (const session of sessions) {
    const startHour = new Date(session.startTime).getHours()
    const dayOfWeek = DAYS_OF_WEEK[new Date(session.startTime).getDay()]

    // Count sessions by start hour
    startHours[startHour] = (startHours[startHour] || 0) + 1

    // Count sessions by day of week
    startDays[dayOfWeek] = (startDays[dayOfWeek] || 0) + 1

    // Format for charts
    const hourKey = `${startHour}:00`
    sessionsPerHour[hourKey] = (sessionsPerHour[hourKey] || 0) + 1
    sessionsPerDay[dayOfWeek] = (sessionsPerDay[dayOfWeek] || 0) + 1
  }

  // Find most common start hour and day
  const mostCommonStartHour = Object.entries(startHours).reduce(
    (most, [hour, count]) => (count > most.count ? { hour: Number.parseInt(hour), count } : most),
    { hour: 0, count: 0 },
  ).hour

  const mostCommonDay = Object.entries(startDays).reduce(
    (most, [day, count]) => (count > most.count ? { day, count } : most),
    { day: "", count: 0 },
  ).day

  // In the return statement, add totalWatchTimeHours to the returned object
  return {
    sessions,
    totalSessions,
    averageSessionDuration,
    longestSession,
    mostVideosSession,
    mostCommonStartHour,
    mostCommonDay,
    sessionsPerDay,
    sessionsPerHour,
    averageVideosPerSession,
    totalWatchTimeHours, // Add this new property
  }
}

// Helper function to create session data from a list of videos
function createSessionData(videos: WatchHistoryItem[]): WatchSession {
  const startTime = new Date(videos[0].time)
  const endTime = new Date(videos[videos.length - 1].time)
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)

  // Count channels and categories
  const channelCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  let totalDurationSeconds = 0

  for (const video of videos) {
    // Count channels
    if (video.subtitles && video.subtitles.length > 0) {
      const channelName = video.subtitles[0].name
      channelCounts[channelName] = (channelCounts[channelName] || 0) + 1
    }

    // Count categories
    if (video.videoDetails?.categoryName) {
      const categoryName = video.videoDetails.categoryName
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
    }

    // Sum up video durations if available
    if (video.videoDetails?.durationSeconds) {
      totalDurationSeconds += video.videoDetails.durationSeconds
    }
  }

  // Calculate average video duration
  const averageVideoDuration = videos.length > 0 ? totalDurationSeconds / videos.length : 0

  return {
    id: `session-${startTime.getTime()}`,
    startTime,
    endTime,
    duration: durationMinutes,
    videos,
    channelCounts,
    categoryCounts,
    totalDurationSeconds,
    averageVideoDuration,
  }
}

// Helper function to format duration in hours and minutes
export function formatSessionDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)

  if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m`
  }
}

// Helper function to format time of day
export function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Helper function to format date
export function formatDate(date: Date): string {
  return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
}

// Add a helper function to format hours
export function formatWatchTimeHours(hours: number): string {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (wholeHours > 0) {
    return `${wholeHours.toLocaleString()} hour${wholeHours !== 1 ? "s" : ""} ${minutes > 0 ? `${minutes} min` : ""}`
  } else {
    return `${minutes} min`
  }
}
