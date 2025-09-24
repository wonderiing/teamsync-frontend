"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EmployeeService } from "@/lib/employees"
import { AttendanceService } from "@/lib/attendance"
import { RequestService } from "@/lib/requests"
import { Logger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react"

interface HRDashboardProps {
  user: User
}

interface HRDashboardData {
  totalEmployees: number
  activeEmployees: number
  todayAttendances: number
  pendingRequests: number
  recentAttendances: Array<{
    id: number
    employeeName: string
    employeeId: number
    date: string
    checkInTime: string
    checkOutTime?: string
    status: "completed" | "in_progress"
  }>
  recentRequests: Array<{
    id: number
    title: string
    employeeName: string
    status: string
    createdAt: string
  }>
  loading: boolean
}

export function HRDashboard({ user }: HRDashboardProps) {
  const [dashboardData, setDashboardData] = useState<HRDashboardData>({
    totalEmployees: 0,
    activeEmployees: 0,
    todayAttendances: 0,
    pendingRequests: 0,
    recentAttendances: [],
    recentRequests: [],
    loading: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }))
      
      // Cargar empleados
      const employeesResponse = await EmployeeService.getCompanyEmployees(0, 100)
      const totalEmployees = employeesResponse.content.length
      const activeEmployees = employeesResponse.content.filter(emp => emp.isActive !== false).length

      // Cargar asistencias de hoy
      const today = new Date().toISOString().split('T')[0]
      const todayAttendancesResponse = await AttendanceService.getCompanyAttendancesByRange(
        today, 
        today, 
        0, 
        50
      )
      const todayAttendances = todayAttendancesResponse.content.length

      // Cargar solicitudes pendientes
      const requestsResponse = await RequestService.getCompanyRequests(0, 50)
      const pendingRequests = requestsResponse.content.filter(req => 
        req.status === 'RECEIVED' || req.status === 'IN_REVIEW'
      ).length

      // Obtener asistencias recientes (últimos 5 registros)
      const recentAttendances = todayAttendancesResponse.content.slice(0, 5).map(attendance => ({
        id: attendance.id,
        employeeName: attendance.employeeName || `Empleado ${attendance.employeeId}`,
        employeeId: attendance.employeeId,
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.checkOutTime ? "completed" : "in_progress" as const
      }))

      // Obtener solicitudes recientes (últimas 5)
      const recentRequests = requestsResponse.content.slice(0, 5).map(request => ({
        id: request.id,
        title: request.title,
        employeeName: request.employeeName || `Empleado ${request.employeeId}`,
        status: request.status,
        createdAt: request.createdAt
      }))

      setDashboardData({
        totalEmployees,
        activeEmployees,
        todayAttendances,
        pendingRequests,
        recentAttendances,
        recentRequests,
        loading: false,
      })

    } catch (error) {
      Logger.error("Error loading HR dashboard data", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos del dashboard",
        variant: "destructive",
      })
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aprobado</Badge>
      case "REJECTED":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rechazado</Badge>
      case "IN_REVIEW":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En Revisión</Badge>
      case "RECEIVED":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Recibido</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{status}</Badge>
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--"
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
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
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 glass-effect">
        <h2 className="text-2xl font-bold mb-2">Panel de Recursos Humanos</h2>
        <p className="text-muted-foreground">Gestiona empleados, asistencias y solicitudes de tu empresa.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-stable">
        <Card className="glass-effect card-hover-animate card-animate stagger-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-chart-1" />
              <span className="text-2xl font-bold">{dashboardData.totalEmployees}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.activeEmployees} activos
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover-animate card-animate stagger-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Asistencias Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold">{dashboardData.todayAttendances}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((dashboardData.todayAttendances / dashboardData.totalEmployees) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover-animate card-animate stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solicitudes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold">{dashboardData.pendingRequests}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="glass-effect card-hover-animate card-animate stagger-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Empleados Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold">{dashboardData.activeEmployees}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((dashboardData.activeEmployees / dashboardData.totalEmployees) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendances */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Asistencias Recientes
            </CardTitle>
            <CardDescription>Últimas asistencias registradas hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAttendances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay asistencias registradas hoy</p>
                </div>
              ) : (
                dashboardData.recentAttendances.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{attendance.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {attendance.employeeId} • {formatTime(attendance.checkInTime)}
                          {attendance.checkOutTime && ` - ${formatTime(attendance.checkOutTime)}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      attendance.status === "completed" 
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {attendance.status === "completed" ? "Completo" : "En progreso"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Solicitudes Recientes
            </CardTitle>
            <CardDescription>Últimas solicitudes de empleados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay solicitudes recientes</p>
                </div>
              ) : (
                dashboardData.recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.employeeName} • {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona tu empresa de manera eficiente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col gap-2 btn-smooth">
              <Users className="w-6 h-6" />
              <span>Gestionar Empleados</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent btn-smooth">
              <Clock className="w-6 h-6" />
              <span>Ver Asistencias</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent btn-smooth">
              <FileText className="w-6 h-6" />
              <span>Gestionar Solicitudes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}