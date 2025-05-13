// This file will be used as a Web Worker to process watch history data off the main thread

// Define the message types
interface WorkerMessage {
  type: "PARSE_HISTORY"
  data: string
  options?: {
    maxItems?: number
  }
}

interface WorkerResponse {
  type: "PROGRESS" | "COMPLETE" | "ERROR"
  data?: any
  progress?: number
  error?: string
}

// Import the parsing functions
import { cleanJsonString, extractVideoId, isValidWatchHistoryItem } from "./parse-utils"

// Listen for messages from the main thread
self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === "PARSE_HISTORY") {
    await parseWatchHistory(event.data.data, event.data.options)
  }
})

// Parse watch history function optimized for web worker
async function parseWatchHistory(jsonString: string, options: { maxItems?: number } = {}) {
  const { maxItems = Number.POSITIVE_INFINITY } = options

  try {
    // Parse the JSON string with error handling
    let data: any
    try {
      data = JSON.parse(jsonString)
    } catch (e) {
      // Try to clean the JSON string if it's malformed
      const cleanedJson = cleanJsonString(jsonString)
      data = JSON.parse(cleanedJson)
    }

    // Validate that data is an array
    if (!Array.isArray(data)) {
      throw new Error("The JSON file does not contain an array of watch history items")
    }

    // Initialize result object
    const result = {
      items: [],
      totalVideos: 0,
      uniqueChannels: {},
      watchTimeByDay: {},
      watchTimeByMonth: {},
      totalItems: data.length,
      processedItems: 0,
      isPartial: data.length > maxItems,
    }

    // Use a more efficient approach for large arrays
    const totalItems = Math.min(data.length, maxItems)
    const batchSize = 1000 // Process in larger batches in the worker
    let processedCount = 0

    // Process in batches to avoid blocking
    for (let i = 0; i < totalItems; i += batchSize) {
      // Report progress every batch
      self.postMessage({
        type: "PROGRESS",
        progress: Math.min(i / totalItems, 0.99), // Cap at 99% until complete
      } as WorkerResponse)

      // Allow other operations to happen
      await new Promise((resolve) => setTimeout(resolve, 0))

      const end = Math.min(i + batchSize, totalItems)
      const batch = data.slice(i, end)

      // Process this batch
      for (const item of batch) {
        // Validate item structure
        if (!isValidWatchHistoryItem(item)) {
          continue // Skip invalid items
        }

        // Only process YouTube watch history items
        if (
          item.header === "YouTube" &&
          (item.title.startsWith("Watched ") || item.titleUrl?.includes("youtube.com/watch"))
        ) {
          // Extract video ID from the URL
          const videoId = extractVideoId(item.titleUrl)
          if (videoId) {
            item.videoId = videoId
          }

          // Add to items array - only keep essential data to reduce memory usage
          result.items.push({
            title: item.title,
            titleUrl: item.titleUrl,
            time: item.time,
            subtitles: item.subtitles,
            videoId: item.videoId,
          })

          // Increment total videos count
          result.totalVideos++

          // Process channel data
          if (item.subtitles && item.subtitles.length > 0) {
            const channelName = item.subtitles[0].name
            result.uniqueChannels[channelName] = (result.uniqueChannels[channelName] || 0) + 1
          }

          // Process watch time by day
          try {
            const date = new Date(item.time)
            if (!isNaN(date.getTime())) {
              const dayKey = date.toISOString().split("T")[0]
              result.watchTimeByDay[dayKey] = (result.watchTimeByDay[dayKey] || 0) + 1

              // Process watch time by month
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
              result.watchTimeByMonth[monthKey] = (result.watchTimeByMonth[monthKey] || 0) + 1
            }
          } catch (dateError) {
            // Continue processing even if date is invalid
          }
        }
      }

      processedCount += batch.length
      result.processedItems = processedCount
    }

    if (result.items.length === 0) {
      throw new Error("No valid YouTube watch history items found in the file")
    }

    // Send the complete result
    self.postMessage({
      type: "COMPLETE",
      data: result,
    } as WorkerResponse)
  } catch (error) {
    console.error("Error parsing watch history:", error)
    self.postMessage({
      type: "ERROR",
      error: error instanceof Error ? error.message : "Failed to parse watch history",
    } as WorkerResponse)
  }
}
