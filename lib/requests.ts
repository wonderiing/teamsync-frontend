import { Logger } from "./logger" // Assuming Logger is imported from a logger module

const API_BASE_URL = "/api/proxy"

export type RequestType = "CERTIFICATE" | "REIMBURSEMENT" | "INCIDENT" | "OTHER" | "INFORMATION" | "VACATIONS"

export type RequestStatus = "RECEIVED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED"

export interface Request {
  id: number
  employeeId: number
  requestType: RequestType
  title: string
  description: string
  status: RequestStatus
  reason?: string
  createdAt: string
  updatedAt: string
  employeeName?: string
}

export interface RequestResponse {
  content: Request[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface CreateRequestData {
  requestType: RequestType
  title: string
  description: string
}

export interface UpdateRequestStatusData {
  status: RequestStatus
  reason?: string
}

export class RequestService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("teamsync_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  private static transformRequest(backendRequest: any): Request {
    return {
      id: backendRequest.idRequest || backendRequest.id,
      employeeId: backendRequest.idEmployee || backendRequest.employeeId,
      requestType: backendRequest.requestType,
      title: backendRequest.title,
      description: backendRequest.description,
      status: backendRequest.status,
      reason: backendRequest.reason,
      createdAt: backendRequest.createdAt,
      updatedAt: backendRequest.updatedAt,
      employeeName: backendRequest.employeeName
    }
  }

  static async createRequest(data: CreateRequestData): Promise<Request> {
    Logger.info("Creating request", { type: data.requestType, title: data.title })

    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Request creation failed", { status: response.status })
      throw new Error("Error al crear la solicitud")
    }

    const result = await response.json()
    Logger.info("Request created successfully", { requestId: result.idRequest || result.id })
    return this.transformRequest(result)
  }

  static async getRequestById(id: number): Promise<Request> {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener la solicitud")
    }

    const result = await response.json()
    return this.transformRequest(result)
  }

  static async updateRequestStatus(id: number, data: UpdateRequestStatusData): Promise<Request> {
    const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Error al actualizar el estado de la solicitud")
    }

    const result = await response.json()
    return this.transformRequest(result)
  }

  static async getMyRequests(
    page = 0,
    size = 10,
    type?: RequestType,
    status?: RequestStatus,
  ): Promise<RequestResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    if (type) params.append("type", type)
    if (status) params.append("status", status)

    const response = await fetch(`${API_BASE_URL}/requests/my-requests?${params}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener mis solicitudes")
    }

    const data = await response.json()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformRequest),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformRequest) : []
    }
  }

  static async getCompanyRequests(
    page = 0,
    size = 10,
    type?: RequestType,
    status?: RequestStatus,
  ): Promise<RequestResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    if (type) params.append("type", type)
    if (status) params.append("status", status)

    const response = await fetch(`${API_BASE_URL}/requests/company-requests?${params}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener las solicitudes de la empresa")
    }

    const data = await response.json()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformRequest),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformRequest) : []
    }
  }
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  CERTIFICATE: "Constancia",
  REIMBURSEMENT: "Reembolso",
  INCIDENT: "Incidencia",
  OTHER: "Otro",
  INFORMATION: "Información",
  VACATIONS: "Vacaciones",
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  RECEIVED: "Recibido",
  IN_REVIEW: "En Revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  CLOSED: "Cerrado",
}
