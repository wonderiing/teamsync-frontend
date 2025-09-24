"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Server, AlertCircle, CheckCircle } from "lucide-react"

interface BackendStatus {
  status: string
  backend?: {
    url: string
    status?: number
    accessible: boolean
    response?: string
    error?: string
  }
  message?: string
  suggestion?: string
  timestamp: string
}

export function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("[v0] Failed to check backend status:", error)
      setStatus({
        status: "error",
        backend: {
          url: "http://localhost:8090/api/v1",
          accessible: false,
          error: "Failed to check status",
        },
        message: "Cannot check backend status",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (!status) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Checking backend status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isHealthy = status.status === "ok" && status.backend?.accessible

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Server className="h-4 w-4" />
          Backend Status
          <Button variant="ghost" size="sm" onClick={checkStatus} disabled={loading} className="ml-auto h-6 w-6 p-0">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {isHealthy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isHealthy ? "default" : "destructive"}>{isHealthy ? "Connected" : "Disconnected"}</Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div>URL: {status.backend?.url}</div>
            {status.backend?.status && <div>Status: {status.backend.status}</div>}
            {status.backend?.error && <div className="text-red-400">Error: {status.backend.error}</div>}
            {status.message && <div className="text-yellow-400">{status.message}</div>}
            {status.suggestion && <div className="text-blue-400">{status.suggestion}</div>}
            <div>Last checked: {new Date(status.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
