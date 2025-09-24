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
      
      // Cargar empresas
      const companiesResponse = await CompanyService.getAllCompanies(0, 100)
      const totalCompanies = companiesResponse.content.length

      // Cargar empleados de todas las empresas
      const employeesResponse = await EmployeeService.getAllEmployees(0, 100)
      const totalEmployees = employeesResponse.content.length

      // Cargar asistencias recientes
      const attendancesResponse = await AttendanceService.getCompanyAttendances(0, 100)
      const totalAttendances = attendancesResponse.content.length

      // Cargar solicitudes recientes
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 glass-effect">
        <h2 className="text-2xl font-bold mb-2">Panel de Administración</h2>
        <p className="text-muted-foreground">Control total del sistema, empresas y configuraciones globales.</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect card-hover stagger-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-chart-1" />
              <span className="text-2xl font-bold">{dashboardData.totalCompanies}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Empresas registradas</p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover stagger-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold">{dashboardData.totalEmployees}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Empleados en el sistema</p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Asistencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold">{dashboardData.totalAttendances}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registros de asistencia</p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover stagger-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-chart-2" />
              <span className="text-2xl font-bold">{dashboardData.totalRequests}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Solicitudes procesadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <p className="font-medium text-sm">TechCorp Solutions</p>
                  <p className="text-xs text-muted-foreground">245 empleados</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activa</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">InnovateLab Inc.</p>
                  <p className="text-xs text-muted-foreground">89 empleados</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activa</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">Nueva Empresa</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Ver Todas
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Seguridad y Permisos
            </CardTitle>
            <CardDescription>Control de acceso y auditoría</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Intentos de acceso fallidos</p>
                  <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
                </div>
                <span className="text-lg font-bold text-red-400">3</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Sesiones activas</p>
                  <p className="text-xs text-muted-foreground">Usuarios conectados</p>
                </div>
                <span className="text-lg font-bold text-green-400">892</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">Ver Logs</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-chart-4" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Monitoreo
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Mantenimiento
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-chart-5" />
              Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Backup
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Optimizar
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Sistema Global
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Integraciones
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
