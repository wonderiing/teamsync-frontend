import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "http://localhost:8090/api/v1"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "GET")
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "POST")
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "PUT")
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "DELETE")
}

async function handleRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    const path = pathSegments.join("/")
    const url = `${API_BASE_URL}/${path}`

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const finalUrl = queryString ? `${url}?${queryString}` : url

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "User-Agent": "Worky-App/1.0",
    }

    // Forward authorization header if present
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      headers.Authorization = authHeader
      
      // Extract companyId from JWT token and add as X-Company-Id header
      try {
        const token = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.companyId) {
          headers['X-Company-Id'] = payload.companyId.toString()
        }
      } catch (error) {
        console.log('[v0] Could not extract companyId from token:', error)
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    }

    // Add body for POST/PUT requests
    if (method === "POST" || method === "PUT") {
      const body = await request.text()
      if (body) {
        requestOptions.body = body
        console.log(`[v0] Request body:`, body)
      }
    }

    console.log(`[v0] Proxying ${method} request to: ${finalUrl}`)
    console.log(`[v0] Request headers:`, headers)
    
    // Log the extracted companyId for debugging
    if (headers['X-Company-Id']) {
      console.log(`[v0] Added X-Company-Id header:`, headers['X-Company-Id'])
    }

    // Make the request to the backend
    const response = await fetch(finalUrl, requestOptions)

    // Get response data
    const responseData = await response.text()

    console.log(`[v0] Backend response status: ${response.status}`)
    console.log(`[v0] Backend response data:`, responseData)

    // Return the response
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy error:", error)

    let errorMessage = "Internal server error"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Request timeout - backend server may be down"
        statusCode = 504
      } else if (error.message.includes("fetch")) {
        errorMessage = "Cannot connect to backend server at localhost:8090"
        statusCode = 503
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Make sure the backend server is running on localhost:8090",
      },
      {
        status: statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
