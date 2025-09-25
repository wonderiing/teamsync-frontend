"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Menu, User, Mail, Building2, Shield, Settings, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()

  // Estados para los formularios
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  })

  const [loadingSave, setLoadingSave] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push("/")
    return null
  }

  const handleSaveProfile = async () => {
    setLoadingSave(true)
    try {
      // Aquí iría la lógica para actualizar el perfil
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoadingSave(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar
        user={user!}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">T</span>
              </div>
              <span className="font-bold text-lg">TeamSync</span>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl p-6 glass-effect border border-blue-500/30">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Configuración
                </h1>
                <p className="text-muted-foreground">
                  Gestiona tu perfil y configuración de cuenta
                </p>
              </div>

              {/* User Info */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Información del Perfil
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {user?.fullName?.charAt(0) || user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user?.fullName || user?.username}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={user?.role === "ADMIN" ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                                       user?.role === "HR" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : 
                                       "bg-green-500/20 text-green-400 border-green-500/30"}>
                          {user?.role === "EMPLOYEE" && "Empleado"}
                          {user?.role === "HR" && "Recursos Humanos"}
                          {user?.role === "ADMIN" && "Administrador"}
                        </Badge>
                        {user?.companyId && (
                          <Badge variant="outline" className="bg-muted/50">
                            <Building2 className="w-3 h-3 mr-1" />
                            Empresa ID: {user.companyId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="tu@empresa.com"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={loadingSave} className="w-full">
                    {loadingSave ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Configuración de Cuenta
                  </CardTitle>
                  <CardDescription>
                    Gestiona la seguridad y configuración de tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">Cambiar Contraseña</p>
                        <p className="text-xs text-muted-foreground">Actualiza tu contraseña de acceso</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Cambiar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">Configuración de Notificaciones</p>
                        <p className="text-xs text-muted-foreground">Gestiona las notificaciones del sistema</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>

                    {user?.role === "ADMIN" && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">Configuración del Sistema</p>
                          <p className="text-xs text-muted-foreground">Configuración global del sistema</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    Información del Sistema
                  </CardTitle>
                  <CardDescription>
                    Información sobre tu cuenta y permisos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usuario:</span>
                        <span className="font-medium">{user?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rol:</span>
                        <span className="font-medium">
                          {user?.role === "EMPLOYEE" && "Empleado"}
                          {user?.role === "HR" && "Recursos Humanos"}
                          {user?.role === "ADMIN" && "Administrador"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empresa ID:</span>
                        <span className="font-medium">{user?.companyId || "No asignada"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posición:</span>
                        <span className="font-medium">{user?.position || "No especificada"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
