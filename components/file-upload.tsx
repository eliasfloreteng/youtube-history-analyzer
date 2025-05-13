"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, AlertCircle, FileJson } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export function FileUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [processAll, setProcessAll] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) {
      return
    }

    // Accept any file type but warn if it's not JSON
    if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith(".json")) {
      setError("Warning: This doesn't appear to be a JSON file. Processing may fail.")
    }

    // Check file size and warn if it's large
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    setFileSize(fileSizeMB)

    if (fileSizeMB > 10) {
      setError(`Warning: Large file (${fileSizeMB.toFixed(1)} MB). Processing may take longer and use more memory.`)
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsUploading(true)
    setProgress(5)
    setError(null)

    try {
      // Read the file as text
      const text = await readFileAsText(file, (progress) => {
        setProgress(5 + progress * 15) // 5-20% progress during file reading
      })

      setProgress(20)

      // Create a web worker for processing
      if (!workerRef.current) {
        workerRef.current = new Worker(new URL("../lib/watch-history-worker.ts", import.meta.url))
      }

      const worker = workerRef.current

      // Set up message handler for the worker
      worker.onmessage = (event) => {
        const { type, data, progress: workerProgress, error: workerError } = event.data

        if (type === "PROGRESS") {
          setProgress(20 + workerProgress * 70) // 20-90% progress during processing
        } else if (type === "COMPLETE") {
          setProgress(90)

          // Store in localStorage or IndexedDB based on size
          if (data.items.length > 5000) {
            // For very large datasets, use IndexedDB
            storeInIndexedDB("youtubeWatchHistory", data).then(() => {
              setProgress(100)
              router.push("/dashboard")
            })
          } else {
            // For smaller datasets, use localStorage
            try {
              localStorage.setItem("youtubeWatchHistory", JSON.stringify(data))
            } catch (storageError) {
              // If localStorage fails, use sessionStorage as fallback
              try {
                sessionStorage.setItem("youtubeWatchHistory", JSON.stringify(data))
              } catch (sessionStorageError) {
                // If both fail, use IndexedDB
                storeInIndexedDB("youtubeWatchHistory", data)
              }
            }

            setProgress(100)
            router.push("/dashboard")
          }
        } else if (type === "ERROR") {
          setError(`Failed to process the file: ${workerError}`)
          setIsUploading(false)
          setProgress(0)
        }
      }

      // Send the data to the worker for processing
      worker.postMessage({
        type: "PARSE_HISTORY",
        data: text,
        options: {
          maxItems: processAll ? Number.POSITIVE_INFINITY : 10000, // Limit to 10,000 items unless "process all" is checked
        },
      })
    } catch (fileError) {
      console.error("File reading error:", fileError)
      setError("Failed to read the file. The file may be too large for your browser to handle.")
      setIsUploading(false)
      setProgress(0)
    }
  }

  // Function to read file as text
  const readFileAsText = (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error("Failed to read file"))
        }
      }

      reader.onerror = (e) => {
        reject(new Error("Error reading file"))
      }

      reader.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(e.loaded / e.total)
        }
      }

      reader.readAsText(file)
    })
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Watch History</CardTitle>
        <CardDescription>Upload your watch-history.json file from Google Takeout</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant={error.startsWith("Warning") ? "warning" : "destructive"} className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error.startsWith("Warning") ? "Warning" : "Error"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 px-5 py-4 text-center transition-colors hover:bg-muted/25"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {file ? (
              <>
                <FileJson className="h-8 w-8 text-primary" />
                <p className="mt-2 text-sm font-medium">File selected: {file.name}</p>
                <p className="text-xs text-muted-foreground">{fileSize.toFixed(2)} MB • Click to change file</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Drag & drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports watch-history.json from Google Takeout</p>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {file && (
            <div className="flex w-full items-center justify-between rounded-md bg-muted p-2">
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs text-muted-foreground">{fileSize.toFixed(2)} MB</span>
            </div>
          )}

          {file && fileSize > 5 && (
            <div className="flex items-center space-x-2 self-start">
              <Checkbox
                id="process-all"
                checked={processAll}
                onCheckedChange={(checked) => setProcessAll(checked as boolean)}
              />
              <label
                htmlFor="process-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Process entire file ({fileSize.toFixed(1)} MB)
              </label>
            </div>
          )}

          {isUploading && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 20
                  ? "Reading file..."
                  : progress < 90
                    ? "Processing your watch history..."
                    : "Finalizing..."}{" "}
                {progress.toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? "Processing..." : "Analyze Watch History"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Your data is processed locally and never leaves your browser
        </p>
      </CardFooter>
    </Card>
  )
}
