import { Logger } from "./logger"

const API_BASE_URL = "/api/proxy"

export interface Tutorial {
  id: number
  idCompany: number
  title: string
  description: string
  durationMinutes: number
  tutorialUrl: string
  category: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface TutorialResponse {
  content: Tutorial[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface CreateTutorialData {
  idCompany: number
  title: string
  description: string
  durationMinutes: number
  tutorialUrl: string
  category: string
}

export class TrainingService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("teamsync_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  private static getCompanyIdFromToken(): number | null {
    const token = localStorage.getItem("teamsync_token")
    if (!token) return null
    
    try {
      // Decodificar el JWT (solo la parte del payload)
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.companyId || null
    } catch (error) {
      Logger.error("Error decoding token", error)
      return null
    }
  }

  private static transformTutorial(backendTutorial: any): Tutorial {
    return {
      id: backendTutorial.idTutorial || backendTutorial.id,
      idCompany: backendTutorial.idCompany || backendTutorial.companyId,
      title: backendTutorial.title,
      description: backendTutorial.description,
      durationMinutes: backendTutorial.durationMinutes,
      tutorialUrl: backendTutorial.tutorialUrl,
      category: backendTutorial.category,
      createdAt: backendTutorial.createdAt,
      updatedAt: backendTutorial.updatedAt,
      isActive: backendTutorial.isActive
    }
  }

  // HR endpoints
  static async createTutorial(data: CreateTutorialData): Promise<Tutorial> {
    Logger.info("Creating tutorial", { title: data.title, category: data.category })

    const response = await fetch(`${API_BASE_URL}/tutorials`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Tutorial creation failed", { status: response.status })
      throw new Error("Error al crear tutorial")
    }

    const result = await response.json()
    Logger.info("Tutorial created successfully", { tutorialId: result.idTutorial || result.id })
    return this.transformTutorial(result)
  }

  static async updateTutorial(id: number, data: CreateTutorialData): Promise<Tutorial> {
    Logger.info("Updating tutorial", { tutorialId: id, title: data.title })

    const response = await fetch(`${API_BASE_URL}/tutorials/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      Logger.error("Tutorial update failed", { status: response.status })
      throw new Error("Error al actualizar tutorial")
    }

    const result = await response.json()
    Logger.info("Tutorial updated successfully", { tutorialId: id })
    return this.transformTutorial(result)
  }

  static async deleteTutorial(id: number): Promise<void> {
    Logger.info("Deleting tutorial", { tutorialId: id })

    const response = await fetch(`${API_BASE_URL}/tutorials/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      Logger.error("Tutorial deletion failed", { status: response.status })
      throw new Error("Error al eliminar tutorial")
    }

    Logger.info("Tutorial deleted successfully", { tutorialId: id })
  }

  // Employee endpoints
  static async getAllTutorials(page = 0, size = 10): Promise<TutorialResponse> {
    const response = await fetch(`${API_BASE_URL}/tutorials?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener tutoriales")
    }

    const data = await response.json()
    const companyId = this.getCompanyIdFromToken()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      // Filtrar por empresa del usuario
      const filteredData = companyId 
        ? data.filter(tutorial => (tutorial.idCompany || tutorial.companyId) === companyId)
        : data
      
      return {
        content: filteredData.map(this.transformTutorial),
        totalElements: filteredData.length,
        totalPages: Math.ceil(filteredData.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, filtrar y transformar el contenido
    const content = data.content ? data.content.map(this.transformTutorial) : []
    const filteredContent = companyId 
      ? content.filter(tutorial => tutorial.idCompany === companyId)
      : content
    
    return {
      ...data,
      content: filteredContent
    }
  }

  static async getTutorialById(id: number): Promise<Tutorial> {
    const response = await fetch(`${API_BASE_URL}/tutorials/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener tutorial")
    }

    const data = await response.json()
    return this.transformTutorial(data)
  }

  static async getMyCompanyTutorials(page = 0, size = 10): Promise<TutorialResponse> {
    const response = await fetch(`${API_BASE_URL}/tutorials/my-company?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener tutoriales de mi empresa")
    }

    const data = await response.json()
    const companyId = this.getCompanyIdFromToken()
    
    // Si el backend devuelve un array directamente, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      // Filtrar por empresa del usuario
      const filteredData = companyId 
        ? data.filter(tutorial => (tutorial.idCompany || tutorial.companyId) === companyId)
        : data
      
      return {
        content: filteredData.map(this.transformTutorial),
        totalElements: filteredData.length,
        totalPages: Math.ceil(filteredData.length / size),
        size: size,
        number: page
      }
    }
    
    // Si ya viene en el formato correcto, filtrar y transformar el contenido
    const content = data.content ? data.content.map(this.transformTutorial) : []
    const filteredContent = companyId 
      ? content.filter(tutorial => tutorial.idCompany === companyId)
      : content
    
    return {
      ...data,
      content: filteredContent
    }
  }

  static async getTutorialsByCompany(companyId: number, page = 0, size = 10): Promise<TutorialResponse> {
    const response = await fetch(`${API_BASE_URL}/tutorials/company/${companyId}?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Error al obtener tutoriales de la empresa")
    }

    return await response.json()
  }

  static async getTutorialsByCategory(category: string, page = 0, size = 10): Promise<TutorialResponse> {
    const response = await fetch(
      `${API_BASE_URL}/tutorials/category/${encodeURIComponent(category)}?page=${page}&size=${size}`,
      {
        headers: this.getAuthHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error("Error al obtener tutoriales por categoría")
    }

    return await response.json()
  }

  static async searchTutorials(query: string, page = 0, size = 10): Promise<TutorialResponse> {
    const response = await fetch(
      `${API_BASE_URL}/tutorials/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`,
      {
        headers: this.getAuthHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error("Error al buscar tutoriales")
    }

    return await response.json()
  }
}
