"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { fetchVideoDetails } from "@/lib/youtube-api"
import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { ParsedWatchHistory } from "@/lib/parse-watch-history"

interface FetchAllVideosButtonProps {
  watchHistory: ParsedWatchHistory
  onComplete: (updatedWatchHistory: ParsedWatchHistory) => void
  dataSource: "localStorage" | "sessionStorage" | "indexedDB" | "none"
}

export function FetchAllVideosButton({ watchHistory, onComplete, dataSource }: FetchAllVideosButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  const handleFetchAllVideos = async () => {
    if (!watchHistory || !watchHistory.items || watchHistory.items.length === 0) {
      setError("No watch history data available")
      return
    }

    setIsLoading(true)
    setProgress(0)
    setTotal(0)
    setError(null)
    setQuotaExceeded(false)

    try {
      // Extract all video IDs
      const videoIds = watchHistory.items
        .map((item) => item.videoId)
        .filter((id): id is string => id !== undefined && id !== null)

      // Remove duplicates to save API quota
      const uniqueVideoIds = [...new Set(videoIds)]
      setTotal(uniqueVideoIds.length)

      // Fetch video details with progress tracking
      const videoDetails = await fetchVideoDetails(uniqueVideoIds, {
        useCache: true,
        updateCache: true,
        onProgress: (current, total) => {
          setProgress(current)
          setTotal(total)
        },
      })

      // Check if we got fewer results than expected (possible quota exceeded)
      if (Object.keys(videoDetails).length < uniqueVideoIds.length) {
        setQuotaExceeded(true)
      }

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

      // Store the updated data
      if (dataSource === "localStorage") {
        try {
          localStorage.setItem("youtubeWatchHistory", JSON.stringify(updatedWatchHistory))
        } catch (storageError) {
          console.error("Failed to save to localStorage:", storageError)
          sessionStorage.setItem("youtubeWatchHistory", JSON.stringify(updatedWatchHistory))
        }
      } else if (dataSource === "sessionStorage") {
        try {
          sessionStorage.setItem("youtubeWatchHistory", JSON.stringify(updatedWatchHistory))
        } catch (storageError) {
          console.error("Failed to save to sessionStorage:", storageError)
          // Try IndexedDB as fallback
          await storeInIndexedDB("youtubeWatchHistory", updatedWatchHistory)
        }
      } else if (dataSource === "indexedDB") {
        await storeInIndexedDB("youtubeWatchHistory", updatedWatchHistory)
      }

      // Notify parent component
      onComplete(updatedWatchHistory)
    } catch (err) {
      console.error("Error fetching all videos:", err)
      setError("Failed to fetch video details. Please try again later.")
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {quotaExceeded && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Quota Limit</AlertTitle>
          <AlertDescription>
            YouTube API quota limit reached. Some videos couldn't be fetched. The data has been cached and you can try
            again later to fetch more videos.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fetching video details...</span>
            <span>
              {progress} of {total} chunks
            </span>
          </div>
          <Progress value={(progress / Math.max(total, 1)) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            This may take a while depending on the number of videos. Data is being cached to improve future performance.
          </p>
        </div>
      ) : (
        <Button onClick={handleFetchAllVideos} className="w-full">
          <Database className="mr-2 h-4 w-4" />
          Fetch All Video Details
        </Button>
      )}
    </div>
  )
}
