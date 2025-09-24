import { Logger } from "./logger"

const API_BASE_URL = "/api/proxy"

export interface Company {
  id: number
  fullName: string
  rfc: string
  address: string
  email: string
  telephone: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface Department {
  id: number
  fullName: string
  companyId: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface CompanyResponse {
  content: Company[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface DepartmentResponse {
  content: Department[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface CreateCompanyData {
  fullName: string
  rfc: string
  address: string
  email: string
  telephone: string
}

export interface CreateDepartmentData {
  fullName: string
  companyId: number
}

export class CompanyService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("teamsync_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  private static transformCompany(backendCompany: any): Company {
    return {
      id: backendCompany.id,
      fullName: backendCompany.fullName,
      rfc: backendCompany.rfc,
      address: backendCompany.address,
      email: backendCompany.email,
      telephone: backendCompany.telephone,
      createdAt: backendCompany.createdAt,
      updatedAt: backendCompany.updatedAt,
      isActive: backendCompany.isActive !== false
    }
  }

  private static transformDepartment(backendDepartment: any): Department {
    return {
      id: backendDepartment.id,
      fullName: backendDepartment.fullName,
      companyId: backendDepartment.companyId,
      createdAt: backendDepartment.createdAt,
      updatedAt: backendDepartment.updatedAt,
      isActive: backendDepartment.isActive !== false
    }
  }

  // Company endpoints (ADMIN only)
  static async getAllCompanies(page = 0, size = 10): Promise<CompanyResponse> {
    const response = await fetch(`${API_BASE_URL}/companies?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener empresas")
    }

    const data = await response.json()
    
    // Handle array response from backend
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformCompany),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Handle paginated response
    return {
      ...data,
      content: data.content ? data.content.map(this.transformCompany) : []
    }
  }

  static async getCompanyById(id: number): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener empresa")
    }

    const data = await response.json()
    return this.transformCompany(data)
  }

  static async createCompany(data: CreateCompanyData): Promise<Company> {
    Logger.info("Creating company", { fullName: data.fullName, rfc: data.rfc })

    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Company creation failed", { status: response.status })
      throw new Error("Error al crear empresa")
    }

    const result = await response.json()
    Logger.info("Company created successfully", { companyId: result.id })
    return this.transformCompany(result)
  }

  static async updateCompany(id: number, data: CreateCompanyData): Promise<Company> {
    Logger.info("Updating company", { companyId: id, fullName: data.fullName })

    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Company update failed", { status: response.status })
      throw new Error("Error al actualizar empresa")
    }

    const result = await response.json()
    Logger.info("Company updated successfully", { companyId: id })
    return this.transformCompany(result)
  }

  static async deleteCompany(id: number): Promise<void> {
    Logger.info("Deleting company", { companyId: id })

    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      Logger.error("Company deletion failed", { status: response.status })
      throw new Error("Error al eliminar empresa")
    }

    Logger.info("Company deleted successfully", { companyId: id })
  }

  // Department endpoints (ADMIN only)
  static async getAllDepartments(page = 0, size = 10): Promise<DepartmentResponse> {
    const response = await fetch(`${API_BASE_URL}/departments?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener departamentos")
    }

    const data = await response.json()
    
    // Handle array response from backend
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformDepartment),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Handle paginated response
    return {
      ...data,
      content: data.content ? data.content.map(this.transformDepartment) : []
    }
  }

  static async getDepartmentsByCompany(companyId: number, page = 0, size = 10): Promise<DepartmentResponse> {
    const response = await fetch(`${API_BASE_URL}/departments/company/${companyId}?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener departamentos de la empresa")
    }

    const data = await response.json()
    
    // Handle array response from backend
    if (Array.isArray(data)) {
      return {
        content: data.map(this.transformDepartment),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size: size,
        number: page
      }
    }
    
    // Handle paginated response
    return {
      ...data,
      content: data.content ? data.content.map(this.transformDepartment) : []
    }
  }

  static async getDepartmentById(id: number): Promise<Department> {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener departamento")
    }

    const data = await response.json()
    return this.transformDepartment(data)
  }

  static async createDepartment(data: CreateDepartmentData): Promise<Department> {
    Logger.info("Creating department", { fullName: data.fullName, companyId: data.companyId })

    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Department creation failed", { status: response.status })
      throw new Error("Error al crear departamento")
    }

    const result = await response.json()
    Logger.info("Department created successfully", { departmentId: result.id })
    return this.transformDepartment(result)
  }

  static async deleteDepartment(id: number): Promise<void> {
    Logger.info("Deleting department", { departmentId: id })

    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      Logger.error("Department deletion failed", { status: response.status })
      throw new Error("Error al eliminar departamento")
    }

    Logger.info("Department deleted successfully", { departmentId: id })
  }
}
