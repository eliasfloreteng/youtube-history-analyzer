"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface SessionSettingsProps {
  maxGapMinutes: number
  minVideosPerSession: number
  onSettingsChange: (maxGapMinutes: number, minVideosPerSession: number) => void
}

export function SessionSettings({ maxGapMinutes, minVideosPerSession, onSettingsChange }: SessionSettingsProps) {
  const [gapMinutes, setGapMinutes] = useState(maxGapMinutes)
  const [minVideos, setMinVideos] = useState(minVideosPerSession)

  const handleApplySettings = () => {
    onSettingsChange(gapMinutes, minVideos)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Detection Settings</CardTitle>
        <CardDescription>Customize how watching sessions are detected</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Maximum time between videos</span>
            <span className="text-sm text-muted-foreground">{gapMinutes} minutes</span>
          </div>
          <Slider value={[gapMinutes]} min={5} max={120} step={5} onValueChange={(value) => setGapMinutes(value[0])} />
          <p className="text-xs text-muted-foreground">
            Videos watched within this time frame will be considered part of the same session
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Minimum videos per session</span>
            <span className="text-sm text-muted-foreground">{minVideos} videos</span>
          </div>
          <Slider value={[minVideos]} min={2} max={10} step={1} onValueChange={(value) => setMinVideos(value[0])} />
          <p className="text-xs text-muted-foreground">A session must contain at least this many videos</p>
        </div>

        <Button onClick={handleApplySettings} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Apply Settings
        </Button>
      </CardContent>
    </Card>
  )
}
