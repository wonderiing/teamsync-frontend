"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Logger } from "@/lib/logger"
import { Loader2, Mail, User, Lock, Building2 } from "lucide-react"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login, loading } = useAuth()
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("email")

  // Email login form state
  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
    username: "",
  })

  // Username login form state
  const [usernameForm, setUsernameForm] = useState({
    username: "",
    password: "",
  })

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    Logger.info("Attempting email login", { email: emailForm.email })

    try {
      await login({
        email: emailForm.email,
        password: emailForm.password,
        username: emailForm.username || emailForm.email.split("@")[0],
      })
      Logger.info("Email login successful")
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión"
      setError(message)
      Logger.error("Email login failed", { error: message })
    }
  }

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    Logger.info("Attempting username login", { username: usernameForm.username })

    try {
      await login({
        username: usernameForm.username,
        password: usernameForm.password,
      })
      Logger.info("Username login successful")
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión"
      setError(message)
      Logger.error("Username login failed", { error: message })
    }
  }

  return (
    <Card className="w-full max-w-md glass-effect">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Bienvenido a TeamSync</CardTitle>
        <CardDescription>Inicia sesión para acceder a tu plataforma de gestión empresarial</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Usuario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username-optional">Nombre de usuario (opcional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username-optional"
                    type="text"
                    placeholder="usuario"
                    value={emailForm.username}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email-password"
                    type="password"
                    placeholder="••••••••"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión con Email"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="username" className="space-y-4">
            <form onSubmit={handleUsernameLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="usuario"
                    value={usernameForm.username}
                    onChange={(e) => setUsernameForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username-password"
                    type="password"
                    placeholder="••••••••"
                    value={usernameForm.password}
                    onChange={(e) => setUsernameForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión con Usuario"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-center">
          <Button variant="link" onClick={onSwitchToRegister}>
            ¿No tienes cuenta? Regístrate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
