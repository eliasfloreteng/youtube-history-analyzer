"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { parseWatchHistory } from "@/lib/parse-watch-history"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Sample data with a few watch history items
const SAMPLE_DATA = [
  {
    header: "YouTube",
    title: "Watched How to Build a Next.js App",
    titleUrl: "https://www.youtube.com/watch?v=sample1",
    subtitles: [
      {
        name: "Code Tutorial Channel",
        url: "https://www.youtube.com/channel/sample1",
      },
    ],
    time: "2025-05-01T13:00:37.152Z",
    products: ["YouTube"],
    activityControls: ["YouTube watch history"],
  },
  {
    header: "YouTube",
    title: "Watched React Hooks Explained",
    titleUrl: "https://www.youtube.com/watch?v=sample2",
    subtitles: [
      {
        name: "React Tutorials",
        url: "https://www.youtube.com/channel/sample2",
      },
    ],
    time: "2025-04-28T15:34:48.744Z",
    products: ["YouTube"],
    activityControls: ["YouTube watch history"],
  },
  {
    header: "YouTube",
    title: "Watched CSS Grid Layout Tutorial",
    titleUrl: "https://www.youtube.com/watch?v=sample3",
    subtitles: [
      {
        name: "CSS Masters",
        url: "https://www.youtube.com/channel/sample3",
      },
    ],
    time: "2025-04-25T09:31:02.472Z",
    products: ["YouTube"],
    activityControls: ["YouTube watch history"],
  },
  {
    header: "YouTube",
    title: "Watched TypeScript for Beginners",
    titleUrl: "https://www.youtube.com/watch?v=sample4",
    subtitles: [
      {
        name: "Code Tutorial Channel",
        url: "https://www.youtube.com/channel/sample1",
      },
    ],
    time: "2025-04-20T11:22:37.152Z",
    products: ["YouTube"],
    activityControls: ["YouTube watch history"],
  },
  {
    header: "YouTube",
    title: "Watched Tailwind CSS Crash Course",
    titleUrl: "https://www.youtube.com/watch?v=sample5",
    subtitles: [
      {
        name: "CSS Masters",
        url: "https://www.youtube.com/channel/sample3",
      },
    ],
    time: "2025-04-15T16:45:12.472Z",
    products: ["YouTube"],
    activityControls: ["YouTube watch history"],
  },
]

export function SampleDataButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUseSampleData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Generate more sample data by duplicating and modifying dates
      const extendedSampleData = [...SAMPLE_DATA]

      // Add more items with different dates to make the sample data more interesting
      for (let i = 0; i < 3; i++) {
        SAMPLE_DATA.forEach((item, index) => {
          const newItem = { ...item }
          const date = new Date(item.time)

          // Adjust date for each batch
          date.setDate(date.getDate() - 10 * (i + 1))

          // Slightly adjust hours to create variation
          date.setHours(date.getHours() - (index % 12))

          newItem.time = date.toISOString()
          extendedSampleData.push(newItem)
        })
      }

      // Parse the sample data
      const watchHistory = await parseWatchHistory(JSON.stringify(extendedSampleData))

      // Store in localStorage
      try {
        localStorage.setItem("youtubeWatchHistory", JSON.stringify(watchHistory))
      } catch (storageError) {
        sessionStorage.setItem("youtubeWatchHistory", JSON.stringify(watchHistory))
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Sample data error:", err)
      setError("Failed to load sample data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button variant="outline" className="w-full" onClick={handleUseSampleData} disabled={isLoading}>
        {isLoading ? "Loading Sample Data..." : "Try with Sample Data"}
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-2">
        Don't have a watch history file? Try the app with our sample data.
      </p>
    </div>
  )
}
