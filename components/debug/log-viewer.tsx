"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Logger, type LogEntry } from "@/lib/logger"
import { Trash2, RefreshCw, Bug } from "lucide-react"

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    Logger.loadLogs()
    setLogs(Logger.getLogs())

    // Refresh logs every 2 seconds
    const interval = setInterval(() => {
      setLogs(Logger.getLogs())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleClearLogs = () => {
    Logger.clearLogs()
    setLogs([])
  }

  const handleRefresh = () => {
    setLogs(Logger.getLogs())
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warn":
        return "secondary"
      default:
        return "default"
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
        <Bug className="w-4 h-4 mr-2" />
        Logs ({logs.length})
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 glass-effect">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Application Logs</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={handleClearLogs} variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No logs available</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-xs border rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={getLevelColor(log.level)} className="text-xs">
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-foreground">{log.message}</p>
                  {log.data && (
                    <pre className="mt-1 text-muted-foreground overflow-x-auto">
                      {typeof log.data === "string" ? log.data : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
