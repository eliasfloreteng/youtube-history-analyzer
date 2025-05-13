"use client"

export async function authenticateWithYouTube(): Promise<boolean> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.error("Google Client ID is not defined")
    throw new Error("Google Client ID is not configured")
  }

  // Define the OAuth parameters
  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""
  const scope = "https://www.googleapis.com/auth/youtube.readonly"

  // Generate a random state value for security
  const state = Math.random().toString(36).substring(2, 15)

  // Store the state in localStorage to verify later
  localStorage.setItem("oauthState", state)

  // Construct the authorization URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.append("client_id", clientId)
  authUrl.searchParams.append("redirect_uri", redirectUri)
  authUrl.searchParams.append("response_type", "token")
  authUrl.searchParams.append("scope", scope)
  authUrl.searchParams.append("state", state)
  authUrl.searchParams.append("include_granted_scopes", "true")

  // Open the authorization URL in a popup window
  const width = 600
  const height = 600
  const left = (window.innerWidth - width) / 2
  const top = (window.innerHeight - height) / 2

  try {
    const popup = window.open(
      authUrl.toString(),
      "youtube-auth",
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    if (!popup) {
      alert("Popup blocked. Please allow popups for this site.")
      return false
    }

    // Listen for messages from the popup
    return new Promise((resolve) => {
      // Set a timeout to detect if authentication is taking too long
      const authTimeout = setTimeout(() => {
        window.removeEventListener("message", authListener)
        if (!popup.closed) popup.close()
        resolve(false)
      }, 120000) // 2 minutes timeout

      function authListener(event: MessageEvent) {
        // Verify the origin of the message
        if (event.origin !== window.location.origin) return

        // Check if the message contains the access token
        if (event.data && event.data.type === "OAUTH_CALLBACK") {
          clearTimeout(authTimeout)

          // Remove the event listener
          window.removeEventListener("message", authListener)

          if (event.data.accessToken) {
            // Store the access token
            localStorage.setItem("youtubeAccessToken", event.data.accessToken)

            // Close the popup
            if (!popup.closed) popup.close()

            // Resolve the promise
            resolve(true)
          } else {
            // Authentication failed or was cancelled
            if (!popup.closed) popup.close()
            resolve(false)
          }
        }
      }

      window.addEventListener("message", authListener)

      // Handle the case where the user closes the popup without completing auth
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          clearTimeout(authTimeout)
          window.removeEventListener("message", authListener)
          resolve(false)
        }
      }, 500)
    })
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}
