import { Logger } from "./logger"

const API_BASE_URL = "/api/proxy"

export interface Employee {
  id: number
  companyId: number
  departmentId: number
  fullName: string
  email: string
  telephone: string
  position: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface EmployeeResponse {
  content: Employee[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface CreateEmployeeData {
  companyId: number
  departmentId: number
  fullName: string
  email: string
  telephone: string
  position: string
}

export class EmployeeService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("worky_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  private static transformEmployee(backendEmployee: any): Employee {
    return {
      id: backendEmployee.id,
      companyId: backendEmployee.companyId,
      departmentId: backendEmployee.departmentId,
      fullName: backendEmployee.fullName,
      email: backendEmployee.email,
      telephone: backendEmployee.telephone,
      position: backendEmployee.position,
      createdAt: backendEmployee.createdAt,
      updatedAt: backendEmployee.updatedAt,
      isActive: backendEmployee.status === 'active'
    }
  }

  // HR endpoints
  static async getAllEmployees(page = 0, size = 10): Promise<EmployeeResponse> {
    const response = await fetch(`${API_BASE_URL}/employees?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener empleados")
    }

    const data = await response.json()
    
    // Handle array response from backend
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformEmployee),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Handle paginated response
    return {
      ...data,
      content: data.content ? data.content.map(this.transformEmployee) : []
    }
  }

  static async getEmployeeById(id: number): Promise<Employee> {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener empleado")
    }

    const data = await response.json()
    return this.transformEmployee(data)
  }

  static async getCompanyEmployees(page = 0, size = 10): Promise<EmployeeResponse> {
    const response = await fetch(`${API_BASE_URL}/employees/company-employees?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener empleados de la empresa")
    }

    const data = await response.json()
    
    // Handle array response from backend
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformEmployee),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Handle paginated response
    return {
      ...data,
      content: data.content ? data.content.map(this.transformEmployee) : []
    }
  }

  static async getEmployeesByCompany(companyId: number, page = 0, size = 10): Promise<EmployeeResponse> {
    const response = await fetch(`${API_BASE_URL}/employees/company/${companyId}?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener empleados de la empresa")
    }

    const data = await response.json()
    
    // Handle array response from backend
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformEmployee),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Handle paginated response
    return {
      ...data,
      content: data.content ? data.content.map(this.transformEmployee) : []
    }
  }

  static async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    Logger.info("Creating employee", { fullName: data.fullName, position: data.position })

    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Employee creation failed", { status: response.status })
      throw new Error("Error al crear empleado")
    }

    const result = await response.json()
    Logger.info("Employee created successfully", { employeeId: result.id })
    return this.transformEmployee(result)
  }

  static async updateEmployee(id: number, data: CreateEmployeeData): Promise<Employee> {
    Logger.info("Updating employee", { employeeId: id, fullName: data.fullName })

    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Employee update failed", { status: response.status })
      throw new Error("Error al actualizar empleado")
    }

    const result = await response.json()
    Logger.info("Employee updated successfully", { employeeId: id })
    return this.transformEmployee(result)
  }

  static async deleteEmployee(id: number): Promise<void> {
    Logger.info("Deleting employee", { employeeId: id })

    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      Logger.error("Employee deletion failed", { status: response.status })
      throw new Error("Error al eliminar empleado")
    }

    Logger.info("Employee deleted successfully", { employeeId: id })
  }

  // Employee endpoints
  static async getMyProfile(): Promise<Employee> {
    const response = await fetch(`${API_BASE_URL}/employees/my-profile`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener mi perfil")
    }

    const data = await response.json()
    return this.transformEmployee(data)
  }

  static async searchEmployeeByEmail(email: string): Promise<Employee> {
    const response = await fetch(`${API_BASE_URL}/employees/email?email=${encodeURIComponent(email)}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al buscar empleado por email")
    }

    const data = await response.json()
    return this.transformEmployee(data)
  }
}
