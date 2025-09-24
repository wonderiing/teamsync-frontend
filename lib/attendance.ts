import { Logger } from "./logger" // Assuming Logger is imported from a logger module

const API_BASE_URL = "/api/proxy"

export interface AttendanceRecord {
  id: number
  employeeId: number
  checkInTime: string
  checkOutTime?: string
  notes?: string
  totalHours?: number
  date: string
  employeeName?: string
}

export interface AttendanceResponse {
  content: AttendanceRecord[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export class AttendanceService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("worky_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  private static transformAttendance(backendAttendance: any): AttendanceRecord {
    return {
      id: backendAttendance.idAttendance || backendAttendance.id,
      employeeId: backendAttendance.idEmployee || backendAttendance.employeeId,
      date: backendAttendance.attendanceDate || backendAttendance.date,
      checkInTime: backendAttendance.checkInTime,
      checkOutTime: backendAttendance.checkOutTime,
      notes: backendAttendance.notes,
      totalHours: backendAttendance.workedHours || backendAttendance.totalHours,
      employeeName: backendAttendance.employeeName || backendAttendance.fullName,
    }
  }

  static async checkIn(notes?: string): Promise<AttendanceRecord> {
    Logger.info("Attempting check-in", { notes })

    const response = await fetch(`${API_BASE_URL}/attendances/check-in`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notes: notes || "" }),
    })

    if (!response.ok) {
      Logger.error("Check-in failed", { status: response.status })
      throw new Error("Error al registrar entrada")
    }

    const data = await response.json()
    Logger.info("Check-in successful", { attendanceId: data.idAttendance || data.id })
    return this.transformAttendance(data)
  }

  static async checkOut(notes?: string): Promise<AttendanceRecord> {
    Logger.info("Attempting check-out", { notes })

    const response = await fetch(`${API_BASE_URL}/attendances/check-out`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notes: notes || "" }),
    })

    if (!response.ok) {
      Logger.error("Check-out failed", { status: response.status })
      throw new Error("Error al registrar salida")
    }

    const data = await response.json()
    Logger.info("Check-out successful", { attendanceId: data.idAttendance || data.id })
    return this.transformAttendance(data)
  }

  static async getMyAttendances(page = 0, size = 10): Promise<AttendanceResponse> {
    const response = await fetch(`${API_BASE_URL}/attendances/my-attendances?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener asistencias")
    }

    const data = await response.json()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformAttendance),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformAttendance) : []
    }
  }

  static async getMyAttendancesByRange(
    startDate: string,
    endDate: string,
    page = 0,
    size = 10,
  ): Promise<AttendanceResponse> {
    const response = await fetch(
      `${API_BASE_URL}/attendances/my-attendances/range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() },
    )

    if (!response.ok) {
      throw new Error("Error al obtener asistencias por rango")
    }

    const data = await response.json()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformAttendance),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformAttendance) : []
    }
  }

  static async getCompanyAttendances(page = 0, size = 10): Promise<AttendanceResponse> {
    const response = await fetch(`${API_BASE_URL}/attendances/company-attendances?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener asistencias de la empresa")
    }

    const data = await response.json()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformAttendance),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformAttendance) : []
    }
  }

  static async getCompanyAttendancesByRange(
    startDate: string,
    endDate: string,
    page = 0,
    size = 10,
  ): Promise<AttendanceResponse> {
    const response = await fetch(
      `${API_BASE_URL}/attendances/company-attendances/range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() },
    )

    if (!response.ok) {
      throw new Error("Error al obtener asistencias de la empresa por rango")
    }

    const data = await response.json()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformAttendance),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformAttendance) : []
    }
  }

  static async getAttendanceById(id: number): Promise<AttendanceRecord> {
    const response = await fetch(`${API_BASE_URL}/attendances/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener registro de asistencia")
    }

    const data = await response.json()
    return this.transformAttendance(data)
  }
}
