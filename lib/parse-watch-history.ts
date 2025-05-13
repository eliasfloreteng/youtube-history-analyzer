export interface WatchHistoryItem {
  header: string
  title: string
  titleUrl: string
  subtitles: {
    name: string
    url: string
  }[]
  time: string
  products?: string[]
  activityControls?: string[]
  videoId?: string
  videoDetails?: {
    title: string
    channelTitle: string
    publishedAt: string
    description: string
    thumbnail: string
    duration: string
    durationSeconds: number
    viewCount: string
    likeCount: string
    categoryId: string
    categoryName?: string
  }
}

export interface ParsedWatchHistory {
  items: WatchHistoryItem[]
  totalVideos: number
  uniqueChannels: Map<string, number> | Record<string, number>
  watchTimeByDay: Map<string, number> | Record<string, number>
  watchTimeByMonth: Map<string, number> | Record<string, number>
  totalItems?: number
  processedItems?: number
  isPartial?: boolean
}

interface ParseOptions {
  maxItems?: number
  onProgress?: (progress: number) => void
}

// The main parsing function is now moved to the web worker
// This file now just exports the interfaces
export async function parseWatchHistory(jsonString: string, options?: ParseOptions): Promise<ParsedWatchHistory> {
  // This is a placeholder to satisfy the type checker. The actual implementation is in the worker.
  console.warn("parseWatchHistory should be called from the worker")
  return {
    items: [],
    totalVideos: 0,
    uniqueChannels: new Map(),
    watchTimeByDay: new Map(),
    watchTimeByMonth: new Map(),
  }
}
