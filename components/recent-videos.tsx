import type { ParsedWatchHistory, WatchHistoryItem } from "@/lib/parse-watch-history"
import { formatDistanceToNow } from "date-fns"

interface RecentVideosProps {
  watchHistory: ParsedWatchHistory
  limit?: number
}

export function RecentVideos({ watchHistory, limit = 10 }: RecentVideosProps) {
  // Get the most recent videos
  const recentVideos = watchHistory.items.slice(0, limit)

  if (recentVideos.length === 0) {
    return <div className="text-center py-4">No video data available</div>
  }

  return (
    <div className="space-y-4">
      {recentVideos.map((video, index) => (
        <VideoItem key={index} video={video} />
      ))}
    </div>
  )
}

interface VideoItemProps {
  video: WatchHistoryItem & { videoDetails?: any }
}

function VideoItem({ video }: VideoItemProps) {
  // Extract video title (remove "Watched " prefix)
  const title = video.title.startsWith("Watched ") ? video.title.substring(8) : video.title

  // Format the watch time
  const watchTime = formatDistanceToNow(new Date(video.time), { addSuffix: true })

  // Get channel name
  const channelName = video.subtitles?.[0]?.name || "Unknown Channel"

  // Get video details if available
  const videoDetails = video.videoDetails

  // Generate a placeholder thumbnail using the video ID
  const placeholderThumbnail = video.videoId ? `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg` : null

  return (
    <div className="flex items-start gap-3 pb-3 border-b">
      <div className="flex-shrink-0 w-32 h-18 bg-muted rounded overflow-hidden">
        {videoDetails?.thumbnail ? (
          <img src={videoDetails.thumbnail || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        ) : placeholderThumbnail ? (
          <img src={placeholderThumbnail || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
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
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
          <span>{watchTime}</span>
          {videoDetails?.duration && <span>• {videoDetails.duration}</span>}
          {videoDetails?.categoryName && (
            <span className="px-1.5 py-0.5 bg-muted rounded-full text-xs">{videoDetails.categoryName}</span>
          )}
          {videoDetails?.viewCount && <span>• {Number.parseInt(videoDetails.viewCount).toLocaleString()} views</span>}
        </div>
      </div>
    </div>
  )
}
