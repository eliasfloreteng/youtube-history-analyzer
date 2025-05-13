// Helper function to validate watch history item structure
export function isValidWatchHistoryItem(item: any): boolean {
  return (
    item &&
    typeof item === "object" &&
    typeof item.header === "string" &&
    typeof item.title === "string" &&
    typeof item.titleUrl === "string"
  )
}

// Helper function to clean potentially malformed JSON
export function cleanJsonString(jsonString: string): string {
  // Remove BOM if present
  const cleanedString = jsonString.replace(/^\uFEFF/, "")

  // Try to fix common JSON issues
  return cleanedString
    .replace(/,\s*}/g, "}") // Remove trailing commas in objects
    .replace(/,\s*\]/g, "]") // Remove trailing commas in arrays
    .trim()
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  if (!url) return null

  // Extract video ID from YouTube URL with improved regex
  // This handles various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?#]+)/,
    /youtube\.com\/watch.*[?&]v=([^&\s]+)/,
    /youtube\.com\/embed\/([^/?&\s]+)/,
    /youtube\.com\/v\/([^/?&\s]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}
