import { NextResponse } from "next/server"

const API_BASE_URL = "http://localhost:8090/api/v1"

export async function GET() {
  try {
    console.log("[v0] Health check: Testing connection to backend...")

    // Try to connect to the backend server
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Worky-App-HealthCheck/1.0",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout for health check
    })

    const data = await response.text()

    console.log("[v0] Health check: Backend responded with status", response.status)

    return NextResponse.json({
      status: "ok",
      backend: {
        url: API_BASE_URL,
        status: response.status,
        accessible: true,
        response: data,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Health check: Backend connection failed:", error)

    let errorDetails = "Unknown error"
    if (error instanceof Error) {
      errorDetails = error.message
    }

    return NextResponse.json(
      {
        status: "error",
        backend: {
          url: API_BASE_URL,
          accessible: false,
          error: errorDetails,
        },
        message: "Backend server at localhost:8090 is not accessible",
        suggestion: "Please ensure the backend server is running on port 8090",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
