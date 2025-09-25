"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CompanyService } from "@/lib/companies"
import { EmployeeService } from "@/lib/employees"
import { AttendanceService } from "@/lib/attendance"
import { RequestService } from "@/lib/requests"
import { Logger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import { Building2, Users, Shield, Database, Settings, Server, Activity, Loader2 } from "lucide-react"

interface AdminDashboardProps {
  user: User
}

interface AdminDashboardData {
  totalCompanies: number
  totalEmployees: number
  totalAttendances: number
  totalRequests: number
  loading: boolean
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    totalCompanies: 0,
    totalEmployees: 0,
    totalAttendances: 0,
    totalRequests: 0,
    loading: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }))
      
      // Si es ADMIN, puede ver todas las empresas, si no solo su empresa
      let totalCompanies = 0
      let totalEmployees = 0
      
      // Todos los usuarios (ADMIN, HR, EMPLOYEE) solo ven su empresa
      if (user.companyId) {
        if (user.role === "ADMIN") {
          // ADMIN puede ver todas las empresas pero el dashboard muestra solo su empresa
          totalCompanies = 1 // Solo su empresa para el dashboard
        } else {
          totalCompanies = 1 // Solo su empresa
        }
        
        // Todos ven solo empleados de su empresa
        const employeesResponse = await EmployeeService.getCompanyEmployees(0, 100)
        totalEmployees = employeesResponse.content.length
      }

      // Cargar asistencias de la empresa del usuario
      const attendancesResponse = await AttendanceService.getCompanyAttendances(0, 100)
      const totalAttendances = attendancesResponse.content.length

      // Cargar solicitudes de la empresa del usuario
      const requestsResponse = await RequestService.getCompanyRequests(0, 100)
      const totalRequests = requestsResponse.content.length

      setDashboardData({
        totalCompanies,
        totalEmployees,
        totalAttendances,
        totalRequests,
        loading: false,
      })

    } catch (error) {
      Logger.error("Error loading admin dashboard data", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos del dashboard",
        variant: "destructive",
      })
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  if (dashboardData.loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6 bg-background text-foreground">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-xl p-6 glass-effect border border-red-500/30">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          {user.role === "ADMIN" ? "Panel de Administración" : 
           user.role === "HR" ? "Panel de Recursos Humanos" : 
           "Panel de Empleado"}
        </h2>
        <p className="text-muted-foreground">
          Gestión de empleados, asistencias y solicitudes de tu empresa (ID: {user.companyId}).
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect card-hover stagger-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mi Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-chart-1" />
              <span className="text-2xl font-bold">{dashboardData.totalCompanies}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Empresa asignada
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover stagger-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mis Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold">{dashboardData.totalEmployees}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Empleados en mi empresa
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asistencias Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold">{dashboardData.totalAttendances}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Asistencias de mi empresa
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover stagger-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solicitudes Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-chart-2" />
              <span className="text-2xl font-bold">{dashboardData.totalRequests}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Solicitudes de mi empresa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user.role === "ADMIN" && (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-chart-3" />
                Gestión de Empresas
              </CardTitle>
              <CardDescription>Administra empresas y departamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Total Empresas</p>
                    <p className="text-xs text-muted-foreground">{dashboardData.totalCompanies} registradas</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activas</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => window.location.href = "/departments"}
                >
                  Gestionar Departamentos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              {user.role === "ADMIN" ? "Gestión Global" : "Gestión de Empleados"}
            </CardTitle>
            <CardDescription>
              {user.role === "ADMIN" 
                ? "Administra empleados de todas las empresas" 
                : "Gestiona empleados de tu empresa"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Total Empleados</p>
                  <p className="text-xs text-muted-foreground">{dashboardData.totalEmployees} registrados</p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Activos</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">Ver Empleados</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Crear Empleado
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Asistencias y Solicitudes
            </CardTitle>
            <CardDescription>Gestiona asistencias y solicitudes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Asistencias Registradas</p>
                  <p className="text-xs text-muted-foreground">{dashboardData.totalAttendances} registros</p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Activo</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Solicitudes Pendientes</p>
                  <p className="text-xs text-muted-foreground">{dashboardData.totalRequests} solicitudes</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendiente</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">Ver Asistencias</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Gestionar Solicitudes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-chart-1" />
              Capacitación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Ver Tutoriales
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Crear Tutorial
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Empleados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Ver Empleados
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Crear Empleado
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Asistencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Ver Asistencias
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Reportes
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Ver Solicitudes
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Gestionar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Management - Solo para ADMIN */}
      {user.role === "ADMIN" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-chart-3" />
                Empresas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                Gestionar Empresas
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Crear Empresa
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-chart-5" />
                Departamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                Ver Departamentos
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Crear Departamento
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                Monitoreo
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Configuración
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
