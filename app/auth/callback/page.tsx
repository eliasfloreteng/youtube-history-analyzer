"use client"

import { useEffect, useState } from "react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Parse the URL hash to extract the access token
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get("access_token")
      const state = params.get("state")
      const error = params.get("error")

      if (error) {
        setStatus("error")
        setErrorMessage(`Authentication error: ${error}`)

        // Send error to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "OAUTH_CALLBACK",
              error,
            },
            window.location.origin,
          )
        }
      } else {
        // Verify the state parameter to prevent CSRF attacks
        const storedState = localStorage.getItem("oauthState")

        if (accessToken && state && state === storedState) {
          setStatus("success")

          // Send the access token to the parent window
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "OAUTH_CALLBACK",
                accessToken,
              },
              window.location.origin,
            )
          }

          // Clean up
          localStorage.removeItem("oauthState")
        } else {
          setStatus("error")
          setErrorMessage("Invalid state parameter or missing access token")

          // Send error to parent window
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "OAUTH_CALLBACK",
                error: "Invalid state parameter or missing access token",
              },
              window.location.origin,
            )
          }
        }
      }

      // Close the window after a short delay
      setTimeout(() => {
        window.close()
      }, 2000)
    } catch (error) {
      setStatus("error")
      setErrorMessage("An unexpected error occurred during authentication")

      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_CALLBACK",
            error: "An unexpected error occurred",
          },
          window.location.origin,
        )
      }

      // Close the window after a short delay
      setTimeout(() => {
        window.close()
      }, 2000)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        {status === "processing" && (
          <>
            <h1 className="text-2xl font-bold">Processing Authentication...</h1>
            <p className="mt-2">Please wait while we complete the authentication process.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold">Authentication Successful</h1>
            <p className="mt-2">You can close this window now.</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-500">Authentication Failed</h1>
            <p className="mt-2">{errorMessage || "An error occurred during authentication."}</p>
            <p className="mt-1">This window will close automatically.</p>
          </>
        )}
      </div>
    </div>
  )
}
