"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthService } from "@/lib/auth"
import { Logger } from "@/lib/logger"
import { Loader2, User, Mail, Lock, Building2, Users } from "lucide-react"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("employee")

  // Employee registration form
  const [employeeForm, setEmployeeForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // HR registration form
  const [hrForm, setHrForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyId: "",
  })

  const handleEmployeeRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (employeeForm.password !== employeeForm.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (employeeForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      await AuthService.registerEmployee(employeeForm.username, employeeForm.email, employeeForm.password)
      Logger.info("Employee registration completed successfully")
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrar empleado"
      setError(message)
      Logger.error("Employee registration failed", { error: message })
    } finally {
      setLoading(false)
    }
  }

  const handleHRRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (hrForm.password !== hrForm.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (hrForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (!hrForm.companyId) {
      setError("Debe seleccionar una empresa")
      return
    }

    setLoading(true)

    try {
      await AuthService.registerHR(hrForm.username, hrForm.email, hrForm.password, Number.parseInt(hrForm.companyId))
      Logger.info("HR registration completed successfully")
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrar HR"
      setError(message)
      Logger.error("HR registration failed", { error: message })
    } finally {
      setLoading(false)
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
        <CardTitle className="text-2xl font-bold">Registro en Worky</CardTitle>
        <CardDescription>Crea tu cuenta para comenzar a usar la plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Empleado
            </TabsTrigger>
            <TabsTrigger value="hr" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Recursos Humanos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employee" className="space-y-4">
            <form onSubmit={handleEmployeeRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emp-username">Nombre de usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emp-username"
                    type="text"
                    placeholder="usuario"
                    value={employeeForm.username}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emp-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emp-email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emp-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emp-password"
                    type="password"
                    placeholder="••••••••"
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emp-confirm-password">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emp-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={employeeForm.confirmPassword}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar como Empleado"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="hr" className="space-y-4">
            <form onSubmit={handleHRRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hr-username">Nombre de usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hr-username"
                    type="text"
                    placeholder="usuario"
                    value={hrForm.username}
                    onChange={(e) => setHrForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hr-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hr-email"
                    type="email"
                    placeholder="hr@empresa.com"
                    value={hrForm.email}
                    onChange={(e) => setHrForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hr-company">Empresa</Label>
                <Select
                  value={hrForm.companyId}
                  onValueChange={(value) => setHrForm((prev) => ({ ...prev, companyId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Empresa Demo 1</SelectItem>
                    <SelectItem value="2">Empresa Demo 2</SelectItem>
                    <SelectItem value="3">Empresa Demo 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hr-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hr-password"
                    type="password"
                    placeholder="••••••••"
                    value={hrForm.password}
                    onChange={(e) => setHrForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hr-confirm-password">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hr-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={hrForm.confirmPassword}
                    onChange={(e) => setHrForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar como HR"
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
          <Button variant="link" onClick={onSwitchToLogin}>
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
