import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface TotalWatchTimeProps {
  totalHours: number
  sessionWatchTimeHours?: number
}

export function TotalWatchTime({ totalHours, sessionWatchTimeHours }: TotalWatchTimeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Watch Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Estimated Total Hours</span>
            </div>
            <p className="text-3xl font-bold">{totalHours.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {Math.floor(totalHours / 24)} days, {totalHours % 24} hours
            </p>
          </div>

          {sessionWatchTimeHours !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Session Watch Hours</span>
              </div>
              <p className="text-3xl font-bold">{Math.round(sessionWatchTimeHours).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Based on continuous watching sessions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
