"use client"

import { useState, useEffect } from "react"
import { AuthService, type User } from "@/lib/auth"
import { Logger } from "@/lib/logger"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateUser = async () => {
      Logger.info("Validating user token on app start")
      try {
        const validatedUser = await AuthService.validateToken()
        setUser(validatedUser)
        if (validatedUser) {
          Logger.info("User validation successful", {
            userId: validatedUser.id,
            role: validatedUser.role,
          })
        } else {
          Logger.info("No valid user token found")
        }
      } catch (error) {
        Logger.error("Auth validation error", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    validateUser()
  }, [])

  const login = async (credentials: { email?: string; username?: string; password: string }) => {
    setLoading(true)
    Logger.info("Starting login process", {
      loginType: credentials.email ? "email" : "username",
      identifier: credentials.email || credentials.username,
    })

    try {
      let response
      if (credentials.email) {
        response = await AuthService.loginWithEmail(
          credentials.email,
          credentials.password,
          credentials.username || credentials.email.split("@")[0],
        )
      } else if (credentials.username) {
        response = await AuthService.loginWithUsername(credentials.username, credentials.password)
      } else {
        throw new Error("Email or username required")
      }

      console.log("✅ Login successful, setting user:", response.user)
      setUser(response.user)
      Logger.info("Login successful", {
        userId: response.user.id,
        role: response.user.role,
        username: response.user.username,
      })

      // Forzar actualización del estado
      setTimeout(() => {
        setUser(response.user)
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard"
        }
      }, 100)

      return response
    } catch (error) {
      Logger.error("Login failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    Logger.info("User logging out", { userId: user?.id })
    AuthService.logout()
    setUser(null)
    // Redirigir al login después del logout
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
