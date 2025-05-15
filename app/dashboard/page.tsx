"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { authenticateWithYouTube } from "@/lib/youtube-auth"
import { fetchVideoDetails } from "@/lib/youtube-api"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WatchHistoryStats } from "@/components/watch-history-stats"
import { TopChannels } from "@/components/top-channels"
import { WatchTimeChart } from "@/components/watch-time-chart"
import { RecentVideos } from "@/components/recent-videos"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
// Add the Timer icon import
import { AlertCircle, ArrowLeft, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CategoryAnalysis } from "@/components/category-analysis"
import { WatchTimeStats } from "@/components/watch-time-stats"
import { TimeOfDayAnalysis } from "@/components/time-of-day-analysis"
import { FetchAllVideosButton } from "@/components/fetch-all-videos-button"
import { SessionAnalysis } from "@/components/session-analysis"
// Add the formatWatchTimeHours import
import {
  analyzeWatchSessions,
  type SessionAnalysisResult,
} from "@/lib/session-analysis"
// Add the import for the new component
import { TotalWatchTime } from "@/components/total-watch-time"

// Add a function to calculate total watch time in hours
const calculateTotalWatchTimeHours = (
  watchHistory: ParsedWatchHistory
): number => {
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
  if (videosWithDuration > 0 && watchHistory.totalVideos) {
    const averageDuration = totalWatchTimeSeconds / videosWithDuration
    totalWatchTimeSeconds = averageDuration * watchHistory.totalVideos
  }

  return Math.floor(totalWatchTimeSeconds / 3600)
}

export default function DashboardPage() {
  const router = useRouter()
  const [watchHistory, setWatchHistory] = useState<ParsedWatchHistory | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingVideoDetails, setIsLoadingVideoDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<
    "localStorage" | "sessionStorage" | "indexedDB" | "none"
  >("none")
  const [processAll, setProcessAll] = useState(false) // Declare processAll state
  // In the DashboardPage component, add state for session analysis
  const [sessionAnalysis, setSessionAnalysis] =
    useState<SessionAnalysisResult | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // First try localStorage
        let storedData = localStorage.getItem("youtubeWatchHistory")
        if (storedData) {
          const parsedData = JSON.parse(storedData) as ParsedWatchHistory
          setWatchHistory(parsedData)
          setDataSource("localStorage")
          return
        }

        // Then try sessionStorage
        storedData = sessionStorage.getItem("youtubeWatchHistory")
        if (storedData) {
          const parsedData = JSON.parse(storedData) as ParsedWatchHistory
          setWatchHistory(parsedData)
          setDataSource("sessionStorage")
          return
        }

        // Finally try IndexedDB
        try {
          const indexedDBData = await loadFromIndexedDB("youtubeWatchHistory")
          if (indexedDBData) {
            setWatchHistory(indexedDBData)
            setDataSource("indexedDB")
            return
          }
        } catch (indexedDBError) {
          console.error("Failed to load from IndexedDB:", indexedDBError)
        }

        // No data found
        setDataSource("none")
      } catch (err) {
        console.error("Failed to load watch history data:", err)
        setError(
          "Failed to load watch history data. Please try uploading your file again."
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Check if user is authenticated with YouTube
    const token = localStorage.getItem("youtubeAccessToken")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // Add useEffect to calculate session analysis when watchHistory changes
  useEffect(() => {
    if (watchHistory && watchHistory.items) {
      try {
        const result = analyzeWatchSessions(watchHistory.items, {
          maxGapMinutes: 30,
          minVideosPerSession: 2,
        })
        setSessionAnalysis(result)
      } catch (error) {
        console.error("Error analyzing sessions:", error)
      }
    }
  }, [watchHistory])

  // Function to load data from IndexedDB
  const loadFromIndexedDB = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("YouTubeHistoryDB", 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("watchHistory")) {
          db.createObjectStore("watchHistory")
        }
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["watchHistory"], "readonly")
        const store = transaction.objectStore("watchHistory")

        const getRequest = store.get(key)

        getRequest.onsuccess = () => {
          resolve(getRequest.result)
        }

        getRequest.onerror = () => {
          reject(new Error("Failed to get data from IndexedDB"))
        }
      }

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"))
      }
    })
  }

  const handleAuthenticate = async () => {
    try {
      setAuthError(null)
      const success = await authenticateWithYouTube()
      if (success) {
        setIsAuthenticated(true)
      } else {
        setAuthError("Authentication was cancelled or failed")
      }
    } catch (err) {
      console.error("Auth error:", err)
      setAuthError(
        "Failed to authenticate with YouTube. Please check your internet connection and try again."
      )
    }
  }

  const handleFetchVideoDetails = async () => {
    if (!watchHistory || !isAuthenticated) return

    setIsLoadingVideoDetails(true)
    setError(null)

    try {
      // Get the most recent 50 videos to avoid quota issues
      const recentVideos = watchHistory.items.slice(0, 50)
      const videoIds = recentVideos
        .map((item) => item.videoId)
        .filter(Boolean) as string[]

      const videoDetails = await fetchVideoDetails(videoIds)

      // Update watch history with video details
      const updatedWatchHistory = {
        ...watchHistory,
        items: watchHistory.items.map((item) => {
          if (item.videoId && videoDetails[item.videoId]) {
            return {
              ...item,
              videoDetails: videoDetails[item.videoId],
            }
          }
          return item
        }),
      }

      setWatchHistory(updatedWatchHistory)

      // Store the updated data in the same place it was loaded from
      if (dataSource === "localStorage") {
        try {
          localStorage.setItem(
            "youtubeWatchHistory",
            JSON.stringify(updatedWatchHistory)
          )
        } catch (storageError) {
          console.error("Failed to save to localStorage:", storageError)
          sessionStorage.setItem(
            "youtubeWatchHistory",
            JSON.stringify(updatedWatchHistory)
          )
          setDataSource("sessionStorage")
        }
      } else if (dataSource === "sessionStorage") {
        try {
          sessionStorage.setItem(
            "youtubeWatchHistory",
            JSON.stringify(updatedWatchHistory)
          )
        } catch (storageError) {
          console.error("Failed to save to sessionStorage:", storageError)
          storeInIndexedDB("youtubeWatchHistory", updatedWatchHistory)
          setDataSource("indexedDB")
        }
      } else if (dataSource === "indexedDB") {
        storeInIndexedDB("youtubeWatchHistory", updatedWatchHistory)
      }
    } catch (err) {
      console.error("API error:", err)
      setError(
        "Failed to fetch video details from YouTube API. Please try again later."
      )
    } finally {
      setIsLoadingVideoDetails(false)
    }
  }

  // Function to store data in IndexedDB
  const storeInIndexedDB = (key: string, data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("YouTubeHistoryDB", 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("watchHistory")) {
          db.createObjectStore("watchHistory")
        }
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["watchHistory"], "readwrite")
        const store = transaction.objectStore("watchHistory")

        const storeRequest = store.put(data, key)

        storeRequest.onsuccess = () => {
          resolve()
        }

        storeRequest.onerror = () => {
          reject(new Error("Failed to store data in IndexedDB"))
        }
      }

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"))
      }
    })
  }

  const handleResetData = () => {
    // Clear stored data from all storage mechanisms
    localStorage.removeItem("youtubeWatchHistory")
    sessionStorage.removeItem("youtubeWatchHistory")

    // Clear IndexedDB
    try {
      const request = indexedDB.open("YouTubeHistoryDB", 1)
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["watchHistory"], "readwrite")
        const store = transaction.objectStore("watchHistory")
        store.delete("youtubeWatchHistory")
      }
    } catch (e) {
      console.error("Failed to clear IndexedDB:", e)
    }

    // Redirect to home page
    router.push("/")
  }

  // Handle completion of fetching all videos
  const handleFetchAllComplete = (updatedWatchHistory: ParsedWatchHistory) => {
    setWatchHistory(updatedWatchHistory)
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text="Loading your YouTube watch history data..."
        />
        <div className="grid gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <div className="h-5 w-1/3 animate-pulse rounded-md bg-muted"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-40 animate-pulse rounded-md bg-muted"></div>
                </CardContent>
              </Card>
            ))}
        </div>
      </DashboardShell>
    )
  }

  if (!watchHistory || error) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Data Error"
          text="There was a problem with your watch history data."
        />
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="youtube" />
          <EmptyPlaceholder.Title>Data Error</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {error ||
              "There was a problem loading your watch history data. Please try uploading your file again."}
          </EmptyPlaceholder.Description>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back to upload
            </Button>
          </Link>
        </EmptyPlaceholder>
      </DashboardShell>
    )
  }

  const estimatedTotalWatchTimeSeconds = watchHistory.items.reduce(
    (acc, item) => {
      if (item.videoDetails?.duration) {
        return acc + item.videoDetails.duration
      }
      return acc
    },
    0
  )

  return (
    <DashboardShell>
      <DashboardHeader
        heading="YouTube Watch History Dashboard"
        text={`Analyzing ${watchHistory.totalVideos.toLocaleString()} videos from your watch history`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
              <Button onClick={handleAuthenticate}>
                Connect YouTube Account
              </Button>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                (Optional)
              </span>
            </div>
          ) : !isLoadingVideoDetails ? (
            <Button onClick={handleFetchVideoDetails}>
              Fetch Recent Videos
            </Button>
          ) : (
            <Button disabled>Fetching Video Details...</Button>
          )}

          <Button variant="outline" onClick={handleResetData}>
            Reset Data
          </Button>
        </div>
      </DashboardHeader>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {authError && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Issue</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      {watchHistory.isPartial && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Partial Data</AlertTitle>
          <AlertDescription>
            Your watch history file is large. For performance reasons, we've
            analyzed {watchHistory.processedItems?.toLocaleString()}
            out of {watchHistory.totalItems?.toLocaleString()} items. The
            statistics shown are based on this sample.
            {!processAll &&
              watchHistory.totalItems &&
              watchHistory.totalItems > 10000 && (
                <span className="block mt-1">
                  To analyze your complete history, go back and check "Process
                  entire file" before uploading.
                </span>
              )}
          </AlertDescription>
        </Alert>
      )}

      {dataSource === "indexedDB" && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Large Dataset</AlertTitle>
          <AlertDescription>
            Your watch history contains a large number of videos. We're using
            advanced storage techniques to handle this amount of data
            efficiently.
          </AlertDescription>
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>YouTube API Connection</AlertTitle>
          <AlertDescription>
            Connecting to YouTube API is optional but provides additional data
            like video duration, categories, and thumbnails. You can still
            analyze your watch history without connecting.
          </AlertDescription>
        </Alert>
      )}

      {isAuthenticated && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Fetch All Video Details</CardTitle>
            <CardDescription>
              Fetch details for all videos in your watch history and cache the
              results for better analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FetchAllVideosButton
              watchHistory={watchHistory}
              onComplete={handleFetchAllComplete}
              dataSource={dataSource}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          {isAuthenticated &&
            watchHistory.items.some(
              (item) => item.videoDetails?.categoryName
            ) && <TabsTrigger value="categories">Categories</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <WatchHistoryStats watchHistory={watchHistory} />

          {isAuthenticated &&
            watchHistory.items.some((item) => item.videoDetails) && (
              <>
                <TotalWatchTime
                  totalHours={calculateTotalWatchTimeHours(watchHistory)}
                  sessionWatchTimeHours={sessionAnalysis?.totalWatchTimeHours}
                />
                <WatchTimeStats
                  watchHistory={watchHistory}
                  sessionWatchTimeHours={sessionAnalysis?.totalWatchTimeHours}
                />
              </>
            )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Watch Activity Over Time</CardTitle>
                <CardDescription>
                  Number of videos watched per month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <WatchTimeChart watchHistory={watchHistory} />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Channels</CardTitle>
                <CardDescription>
                  Your most watched YouTube channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopChannels watchHistory={watchHistory} />
              </CardContent>
            </Card>
          </div>

          {isAuthenticated &&
            watchHistory.items.some(
              (item) => item.videoDetails?.categoryName
            ) && <CategoryAnalysis watchHistory={watchHistory} />}

          <Card>
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>
                Your most recently watched videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentVideos watchHistory={watchHistory} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your watched channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopChannels watchHistory={watchHistory} limit={20} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="videos" className="space-y-4">
          <PaginatedVideos watchHistory={watchHistory} />
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Watching Trends</CardTitle>
              <CardDescription>
                Patterns in your YouTube watching habits
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <WatchTimeChart watchHistory={watchHistory} showDaily />
            </CardContent>
          </Card>

          <TimeOfDayAnalysis watchHistory={watchHistory} />
        </TabsContent>
        <TabsContent value="sessions" className="space-y-4">
          <SessionAnalysis watchHistory={watchHistory} />
        </TabsContent>
        {isAuthenticated &&
          watchHistory.items.some(
            (item) => item.videoDetails?.categoryName
          ) && (
            <TabsContent value="categories" className="space-y-4">
              <CategoryAnalysis watchHistory={watchHistory} />
            </TabsContent>
          )}
      </Tabs>
    </DashboardShell>
  )
}

// Paginated videos component for handling large lists
function PaginatedVideos({
  watchHistory,
}: {
  watchHistory: ParsedWatchHistory
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 20

  // Filter videos based on search term
  const filteredVideos = searchTerm
    ? watchHistory.items.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (video.subtitles &&
            video.subtitles[0]?.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    : watchHistory.items

  // Calculate pagination
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVideos = filteredVideos.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video History</CardTitle>
        <CardDescription>Complete list of your watched videos</CardDescription>
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Search videos or channels..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchTerm("")}
            style={{ display: searchTerm ? "block" : "none" }}
          >
            ✕
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentVideos.length > 0 ? (
            <>
              <RecentVideos
                watchHistory={{ ...watchHistory, items: currentVideos }}
                limit={itemsPerPage}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredVideos.length)} of{" "}
                  {filteredVideos.length} videos
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              {searchTerm
                ? "No videos match your search"
                : "No videos available"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
