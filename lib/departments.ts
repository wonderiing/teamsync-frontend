import { Logger } from "./logger"

const API_BASE_URL = "/api/proxy"

export interface Department {
  id: number
  fullName: string
  companyId: number
  createdAt?: string
  updatedAt?: string
}

export interface DepartmentResponse {
  content: Department[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export class DepartmentService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("teamsync_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  private static transformDepartment(backendDepartment: any): Department {
    return {
      id: backendDepartment.id,
      fullName: backendDepartment.fullName,
      companyId: backendDepartment.companyId,
      createdAt: backendDepartment.createdAt,
      updatedAt: backendDepartment.updatedAt,
    }
  }

  /**
   * Obtener todos los departamentos (solo ADMIN)
   * GET /api/v1/departments
   */
  static async getAllDepartments(page = 0, size = 10): Promise<DepartmentResponse> {
    Logger.info("Fetching all departments", { page, size })
    console.log('DepartmentService.getAllDepartments called with:', { page, size })
    console.log('API URL:', `${API_BASE_URL}/departments?page=${page}&size=${size}`)
    console.log('Headers:', this.getAuthHeaders())

    const response = await fetch(`${API_BASE_URL}/departments?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      Logger.error("Failed to fetch departments", { status: response.status })
      console.error('Failed to fetch departments. Status:', response.status)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error("Error al obtener departamentos")
    }

    const data = await response.json()
    console.log('Raw response data:', data)
    Logger.info("Departments fetched successfully", { count: data.content?.length || 0 })
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformDepartment),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformDepartment) : []
    }
  }

  /**
   * Obtener departamentos de una empresa específica (solo ADMIN)
   * GET /api/v1/departments/company/{companyId}
   */
  static async getDepartmentsByCompany(companyId: number, page = 0, size = 10): Promise<DepartmentResponse> {
    Logger.info("Fetching departments by company", { companyId, page, size })

    const response = await fetch(`${API_BASE_URL}/departments/company/${companyId}?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      Logger.error("Failed to fetch departments by company", { status: response.status })
      throw new Error("Error al obtener departamentos de la empresa")
    }

    const data = await response.json()
    Logger.info("Departments by company fetched successfully", { companyId, count: data.content?.length || 0 })
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformDepartment),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, solo transformamos el contenido
    return {
      ...data,
      content: data.content ? data.content.map(this.transformDepartment) : []
    }
  }

  /**
   * Obtener un departamento específico (solo ADMIN)
   * GET /api/v1/departments/{id}
   */
  static async getDepartmentById(id: number): Promise<Department> {
    Logger.info("Fetching department by ID", { id })

    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      Logger.error("Failed to fetch department by ID", { id, status: response.status })
      throw new Error("Error al obtener departamento")
    }

    const data = await response.json()
    Logger.info("Department fetched successfully", { id })
    return this.transformDepartment(data)
  }

  /**
   * Crear un nuevo departamento (solo ADMIN)
   * POST /api/v1/departments
   * Body: {"fullName": "string", "companyId": number}
   */
  static async createDepartment(fullName: string, companyId: number): Promise<Department> {
    Logger.info("Creating department", { fullName, companyId })
    
    const requestBody = {
      fullName,
      companyId,
    }

    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      Logger.error("Failed to create department", { status: response.status })
      throw new Error("Error al crear departamento")
    }

    const data = await response.json()
    Logger.info("Department created successfully", { id: data.id, fullName })
    return this.transformDepartment(data)
  }


  /**
   * Eliminar un departamento (solo ADMIN)
   * DELETE /api/v1/departments/{id}
   */
  static async deleteDepartment(id: number): Promise<void> {
    Logger.info("Deleting department", { id })

    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      Logger.error("Failed to delete department", { id, status: response.status })
      throw new Error("Error al eliminar departamento")
    }

    Logger.info("Department deleted successfully", { id })
  }
}
