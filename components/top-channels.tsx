import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { Progress } from "@/components/ui/progress"

interface TopChannelsProps {
  watchHistory: ParsedWatchHistory
  limit?: number
}

export function TopChannels({ watchHistory, limit = 5 }: TopChannelsProps) {
  // Convert Map to array and sort by count
  let channelsArray = []

  if (watchHistory.uniqueChannels instanceof Map) {
    // If it's a proper Map
    channelsArray = Array.from(watchHistory.uniqueChannels.entries()).map(([name, count]) => ({ name, count }))
  } else if (watchHistory.uniqueChannels && typeof watchHistory.uniqueChannels === "object") {
    // If it's an object (serialized Map)
    channelsArray = Object.entries(watchHistory.uniqueChannels).map(([name, count]) => ({
      name,
      count: count as number,
    }))
  }

  // Sort and limit
  channelsArray = channelsArray.sort((a, b) => b.count - a.count).slice(0, limit)

  // Find the maximum count for percentage calculation
  const maxCount = channelsArray.length > 0 ? channelsArray[0].count : 0

  if (channelsArray.length === 0) {
    return <div className="text-center py-4">No channel data available</div>
  }

  return (
    <div className="space-y-4">
      {channelsArray.map((channel, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium truncate">{channel.name}</span>
            <span className="text-muted-foreground">{channel.count} videos</span>
          </div>
          <Progress value={(channel.count / maxCount) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}
