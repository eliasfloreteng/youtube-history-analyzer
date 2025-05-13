"use client"

import { useState, useEffect } from "react"
import type { ParsedWatchHistory } from "@/lib/parse-watch-history"
import { analyzeWatchSessions } from "@/lib/session-analysis"
import type { SessionAnalysisResult, SessionAnalysisOptions } from "@/lib/session-analysis"
import { SessionStats } from "@/components/session-stats"
import { SessionDistribution } from "@/components/session-distribution"
import { SessionList } from "@/components/session-list"
import { SessionSettings } from "@/components/session-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SessionAnalysisProps {
  watchHistory: ParsedWatchHistory
}

export function SessionAnalysis({ watchHistory }: SessionAnalysisProps) {
  const [sessionAnalysis, setSessionAnalysis] = useState<SessionAnalysisResult | null>(null)
  const [settings, setSettings] = useState<SessionAnalysisOptions>({
    maxGapMinutes: 30,
    minVideosPerSession: 2,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze sessions when component mounts or settings change
  useEffect(() => {
    if (!watchHistory || !watchHistory.items) return

    setIsAnalyzing(true)

    // Use setTimeout to prevent UI freezing for large datasets
    const timeoutId = setTimeout(() => {
      try {
        const result = analyzeWatchSessions(watchHistory.items, settings)
        setSessionAnalysis(result)
      } catch (error) {
        console.error("Error analyzing sessions:", error)
      } finally {
        setIsAnalyzing(false)
      }
    }, 10)

    return () => clearTimeout(timeoutId)
  }, [watchHistory, settings])

  const handleSettingsChange = (maxGapMinutes: number, minVideosPerSession: number) => {
    setSettings({ maxGapMinutes, minVideosPerSession })
  }

  if (!sessionAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Analysis</CardTitle>
          <CardDescription>Analyzing your watching sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <SessionStats sessionAnalysis={sessionAnalysis} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="distribution" className="space-y-4">
            <TabsList>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="distribution" className="space-y-4">
              <SessionDistribution sessionAnalysis={sessionAnalysis} />
            </TabsContent>
            <TabsContent value="sessions" className="space-y-4">
              <SessionList sessions={sessionAnalysis.sessions} limit={10} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="md:col-span-1">
          <SessionSettings
            maxGapMinutes={settings.maxGapMinutes}
            minVideosPerSession={settings.minVideosPerSession}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </div>
  )
}
