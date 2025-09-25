// Simple logger that just uses console.log to avoid "Logger is not defined" errors
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[v0] ${message}`, data || "")
  }

  static warn(message: string, data?: any) {
    console.warn(`[v0] ${message}`, data || "")
  }

  static error(message: string, data?: any) {
    console.error(`[v0] ${message}`, data || "")
  }
}
