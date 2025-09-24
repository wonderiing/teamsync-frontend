export interface User {
  id: number
  username: string
  email: string
  role: "EMPLOYEE" | "HR" | "ADMIN"
  companyId?: number
  fullName?: string
  position?: string
}

export interface LoginResponse {
  token: string
  user: User
}

const API_BASE_URL = "/api/proxy"

export class AuthService {
  private static token: string | null = null

  static setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("worky_token", token)
    }
  }

  static getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("worky_token")
    }
    return this.token
  }

  static removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("worky_token")
    }
  }

  private static async handleAuthResponse(response: Response): Promise<any> {
    if (!response.ok) {
      let errorMessage = "Error de autenticación"

      try {
        const errorData = await response.json()

        if (response.status === 503) {
          errorMessage = "Servidor backend no disponible. Verifica que esté ejecutándose en localhost:8090"
        } else if (response.status === 504) {
          errorMessage = "Timeout de conexión. El servidor backend no responde"
        } else if (response.status === 401) {
          errorMessage = "Credenciales inválidas"
        } else if (response.status === 404) {
          errorMessage = "Endpoint no encontrado. Verifica la configuración del servidor"
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.details) {
          errorMessage = `${errorData.error || "Error"}: ${errorData.details}`
        }
      } catch {
        // If we can't parse the error response, provide a generic message based on status
        if (response.status >= 500) {
          errorMessage = "Error del servidor. Verifica que el backend esté ejecutándose"
        } else if (response.status === 401) {
          errorMessage = "Credenciales inválidas"
        }
      }

      throw new Error(errorMessage)
    }

    return await response.json()
  }

  static async loginWithEmail(email: string, password: string, username: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      })

      const data = await this.handleAuthResponse(response)
      this.setToken(data.token)
      
      // Transformar la respuesta del backend al formato esperado
      const user: User = {
        id: data.employeeId || 0, // Usar employeeId como id, o 0 si es null
        username: data.username,
        email: data.email || email,
        role: data.role,
        companyId: data.companyId,
        fullName: data.fullName || data.username,
        position: data.position
      }
      
      return {
        token: data.token,
        user: user
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("No se puede conectar al servidor. Verifica que el backend esté ejecutándose en localhost:8090")
      }
      throw error
    }
  }

  static async loginWithUsername(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await this.handleAuthResponse(response)
      this.setToken(data.token)
      
      // Transformar la respuesta del backend al formato esperado
      const user: User = {
        id: data.employeeId || 0, // Usar employeeId como id, o 0 si es null
        username: data.username,
        email: data.email || `${data.username}@company.com`, // Email por defecto si no viene
        role: data.role,
        companyId: data.companyId,
        fullName: data.fullName || data.username,
        position: data.position
      }
      
      return {
        token: data.token,
        user: user
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("No se puede conectar al servidor. Verifica que el backend esté ejecutándose en localhost:8090")
      }
      throw error
    }
  }

  static async validateToken(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        this.removeToken()
        return null
      }

      const data = await response.json()
      
      // Transformar la respuesta del backend al formato esperado
      const user: User = {
        id: data.employeeId || data.id || 0,
        username: data.username,
        email: data.email || `${data.username}@company.com`,
        role: data.role,
        companyId: data.companyId,
        fullName: data.fullName || data.username,
        position: data.position
      }
      
      return user
    } catch {
      this.removeToken()
      return null
    }
  }

  static async registerEmployee(username: string, email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      return await this.handleAuthResponse(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("No se puede conectar al servidor. Verifica que el backend esté ejecutándose en localhost:8090")
      }
      throw error
    }
  }

  static async registerHR(
    username: string,
    email: string,
    password: string,
    companyId: number,
  ): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/hr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, companyId }),
      })

      return await this.handleAuthResponse(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("No se puede conectar al servidor. Verifica que el backend esté ejecutándose en localhost:8090")
      }
      throw error
    }
  }

  static logout() {
    this.removeToken()
  }
}
