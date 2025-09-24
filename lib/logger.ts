export class Logger {
  private static logs: LogEntry[] = []
  private static maxLogs = 1000

  static log(level: "info" | "warn" | "error", message: string, data?: any) {
    const entry: LogEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    this.logs.unshift(entry)

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Also log to console with v0 prefix
    const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log"
    console[consoleMethod](`[v0] ${message}`, data || "")

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("teamsync_logs", JSON.stringify(this.logs.slice(0, 100)))
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  static info(message: string, data?: any) {
    this.log("info", message, data)
  }

  static warn(message: string, data?: any) {
    this.log("warn", message, data)
  }

  static error(message: string, data?: any) {
    this.log("error", message, data)
  }

  static getLogs(): LogEntry[] {
    return [...this.logs]
  }

  static clearLogs() {
    this.logs = []
    if (typeof window !== "undefined") {
      localStorage.removeItem("teamsync_logs")
    }
  }

  static loadLogs() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("teamsync_logs")
        if (stored) {
          const parsedLogs = JSON.parse(stored)
          this.logs = parsedLogs
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }
}

export interface LogEntry {
  id: number
  timestamp: string
  level: "info" | "warn" | "error"
  message: string
  data?: any
}
