"use client"

import { cacheService } from "./cache-service"

interface VideoDetail {
  title: string
  channelTitle: string
  publishedAt: string
  description: string
  thumbnail: string
  duration: string
  viewCount: string
  likeCount: string
  categoryId: string
  categoryName?: string
  durationSeconds: number
}

interface FetchOptions {
  useCache?: boolean
  updateCache?: boolean
  forceRefresh?: boolean
  onProgress?: (progress: number, total: number) => void
}

export async function fetchVideoDetails(
  videoIds: string[],
  options: FetchOptions = { useCache: true, updateCache: true },
): Promise<Record<string, VideoDetail>> {
  const { useCache = true, updateCache = true, forceRefresh = false, onProgress } = options

  // Initialize results object
  const results: Record<string, VideoDetail> = {}

  // If using cache, try to get cached results first
  if (useCache && !forceRefresh) {
    const cachedResults = await cacheService.getMultipleVideoDetails(videoIds)

    // Add cached results to the results object
    Object.assign(results, cachedResults)

    // Filter out videoIds that were found in the cache
    videoIds = videoIds.filter((id) => !results[id])

    // If all videos were found in cache, return early
    if (videoIds.length === 0) {
      return results
    }
  }

  const accessToken = localStorage.getItem("youtubeAccessToken")

  if (!accessToken) {
    throw new Error("No access token available")
  }

  // YouTube API only allows 50 video IDs per request
  const chunks: string[][] = []
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50))
  }

  const categoryIds = new Set<string>()
  const newResults: Record<string, VideoDetail> = {}

  // Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    // Report progress if callback provided
    if (onProgress) {
      onProgress(i, chunks.length)
    }

    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos")
      url.searchParams.append("part", "snippet,contentDetails,statistics")
      url.searchParams.append("id", chunk.join(","))

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        // If we hit quota limit, return what we have so far
        if (response.status === 403) {
          console.error("YouTube API quota exceeded")
          break
        }
        throw new Error(`YouTube API error: ${response.status}`)
      }

      const data = await response.json()

      // Process each video item
      for (const item of data.items) {
        const duration = formatDuration(item.contentDetails.duration)
        const durationSeconds = parseDurationToSeconds(item.contentDetails.duration)

        // Collect category IDs for later fetching
        if (item.snippet.categoryId) {
          categoryIds.add(item.snippet.categoryId)
        }

        newResults[item.id] = {
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          duration,
          durationSeconds,
          viewCount: item.statistics.viewCount,
          likeCount: item.statistics.likeCount,
          categoryId: item.snippet.categoryId,
        }
      }

      // Add a small delay to avoid hitting rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error fetching chunk ${i}:`, error)
      // Continue with the next chunk instead of failing completely
    }
  }

  // Fetch category names if we have category IDs
  if (categoryIds.size > 0) {
    try {
      const categoryNames = await fetchCategoryNames(Array.from(categoryIds))

      // Add category names to video details
      for (const videoId in newResults) {
        const video = newResults[videoId]
        if (video.categoryId && categoryNames[video.categoryId]) {
          video.categoryName = categoryNames[video.categoryId]
        }
      }
    } catch (error) {
      console.error("Failed to fetch category names:", error)
    }
  }

  // Update cache if requested
  if (updateCache && Object.keys(newResults).length > 0) {
    try {
      await cacheService.cacheMultipleVideoDetails(newResults, { expirationDays: 30 })
    } catch (cacheError) {
      console.error("Failed to update cache:", cacheError)
    }
  }

  // Combine new results with cached results
  Object.assign(results, newResults)

  // Final progress update
  if (onProgress) {
    onProgress(chunks.length, chunks.length)
  }

  return results
}

// Fetch category names from YouTube API
async function fetchCategoryNames(categoryIds: string[]): Promise<Record<string, string>> {
  const accessToken = localStorage.getItem("youtubeAccessToken")

  if (!accessToken) {
    throw new Error("No access token available")
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/videoCategories")
  url.searchParams.append("part", "snippet")
  url.searchParams.append("id", categoryIds.join(","))

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }

  const data = await response.json()
  const categoryMap: Record<string, string> = {}

  for (const item of data.items) {
    categoryMap[item.id] = item.snippet.title
  }

  return categoryMap
}

// Format ISO 8601 duration to human-readable format
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) return "Unknown"

  const hours = match[1] ? Number.parseInt(match[1]) : 0
  const minutes = match[2] ? Number.parseInt(match[2]) : 0
  const seconds = match[3] ? Number.parseInt(match[3]) : 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
}

// Parse ISO 8601 duration to seconds
function parseDurationToSeconds(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) return 0

  const hours = match[1] ? Number.parseInt(match[1]) : 0
  const minutes = match[2] ? Number.parseInt(match[2]) : 0
  const seconds = match[3] ? Number.parseInt(match[3]) : 0

  return hours * 3600 + minutes * 60 + seconds
}
