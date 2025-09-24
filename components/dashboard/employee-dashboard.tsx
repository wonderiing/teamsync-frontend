"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AttendanceService } from "@/lib/attendance"
import { RequestService } from "@/lib/requests"
import { TrainingService } from "@/lib/training"
import { Logger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import {
  Clock,
  FileText,
  GraduationCap,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Loader2,
} from "lucide-react"

interface EmployeeDashboardProps {
  user: User
}

interface AttendanceStatus {
  isCheckedIn: boolean
  checkInTime?: string
  totalHoursToday: number
  totalHoursWeek: number
  loading: boolean
}

interface DashboardData {
  attendanceStatus: AttendanceStatus
  pendingRequests: number
  recentActivities: Array<{
    id: string
    type: "attendance" | "request" | "training"
    title: string
    description: string
    timestamp: string
    status?: "completed" | "pending" | "approved" | "rejected"
  }>
  loading: boolean
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    attendanceStatus: {
      isCheckedIn: false,
      totalHoursToday: 0,
      totalHoursWeek: 0,
      loading: true,
    },
    pendingRequests: 0,
    recentActivities: [],
    loading: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...')
      setDashboardData(prev => ({ ...prev, loading: true }))
      
      // Timeout para evitar carga infinita
      const timeoutId = setTimeout(() => {
        console.log('Dashboard load timeout, setting loading to false')
        setDashboardData(prev => ({ ...prev, loading: false }))
      }, 10000) // 10 segundos timeout
      
      // Cargar datos de asistencia
      const attendanceResponse = await AttendanceService.getMyAttendances(0, 10)
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = attendanceResponse.content.find(record => record.date === today)
      
      // Calcular horas de la semana
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekAttendance = attendanceResponse.content.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= weekStart && recordDate <= weekEnd
      })
      
      const totalWeekHours = weekAttendance.reduce((total, record) => {
        if (record.checkOutTime && record.checkInTime) {
          const checkIn = new Date(`${record.date}T${record.checkInTime}`)
          const checkOut = new Date(`${record.date}T${record.checkOutTime}`)
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
          return total + hours
        }
        return total
      }, 0)

      // Cargar solicitudes pendientes
      const requestsResponse = await RequestService.getMyRequests(0, 10)
      const pendingRequests = requestsResponse.content.filter(req => 
        req.status === 'RECEIVED' || req.status === 'IN_REVIEW'
      ).length

      // Crear actividades recientes
      const recentActivities = []
      
      // Agregar actividades de asistencia
      attendanceResponse.content.slice(0, 3).forEach(record => {
        if (record.checkOutTime) {
          recentActivities.push({
            id: `attendance-${record.id}`,
            type: 'attendance' as const,
            title: 'Jornada completada',
            description: `Entrada: ${record.checkInTime}, Salida: ${record.checkOutTime}`,
            timestamp: record.createdAt,
            status: 'completed' as const,
          })
        } else {
          recentActivities.push({
            id: `attendance-${record.id}`,
            type: 'attendance' as const,
            title: 'Jornada en progreso',
            description: `Entrada: ${record.checkInTime}`,
            timestamp: record.createdAt,
            status: 'pending' as const,
          })
        }
      })

      // Agregar actividades de solicitudes
      requestsResponse.content.slice(0, 2).forEach(request => {
        recentActivities.push({
          id: `request-${request.id}`,
          type: 'request' as const,
          title: request.title,
          description: request.description,
          timestamp: request.createdAt,
          status: request.status === 'APPROVED' ? 'approved' : 
                  request.status === 'REJECTED' ? 'rejected' : 'pending',
        })
      })

      // Ordenar por timestamp y tomar los más recientes
      recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const newDashboardData = {
        attendanceStatus: {
          isCheckedIn: todayAttendance ? !todayAttendance.checkOutTime : false,
          checkInTime: todayAttendance?.checkInTime,
          totalHoursToday: todayAttendance && todayAttendance.checkOutTime ? 
            (() => {
              const checkIn = new Date(`${todayAttendance.date}T${todayAttendance.checkInTime}`)
              const checkOut = new Date(`${todayAttendance.date}T${todayAttendance.checkOutTime}`)
              return (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
            })() : 0,
          totalHoursWeek: totalWeekHours,
          loading: false,
        },
        pendingRequests,
        recentActivities: recentActivities.slice(0, 5),
        loading: false,
      }
      
      console.log('Dashboard data loaded:', newDashboardData)
      clearTimeout(timeoutId)
      setDashboardData(newDashboardData)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      clearTimeout(timeoutId)
      Logger.error("Error loading dashboard data", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos del dashboard",
        variant: "destructive",
      })
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  const handleCheckIn = async () => {
    try {
      setDashboardData(prev => ({ 
        ...prev, 
        attendanceStatus: { ...prev.attendanceStatus, loading: true }
      }))
      
      await AttendanceService.checkIn()
      await loadDashboardData()
      
      toast({
        title: "Entrada registrada",
        description: "Has registrado tu entrada correctamente",
      })
    } catch (error) {
      Logger.error("Error checking in", error)
      toast({
        title: "Error",
        description: "Error al registrar la entrada",
        variant: "destructive",
      })
      setDashboardData(prev => ({ 
        ...prev, 
        attendanceStatus: { ...prev.attendanceStatus, loading: false }
      }))
    }
  }

  const handleCheckOut = async () => {
    try {
      setDashboardData(prev => ({ 
        ...prev, 
        attendanceStatus: { ...prev.attendanceStatus, loading: true }
      }))
      
      await AttendanceService.checkOut()
      await loadDashboardData()
      
      toast({
        title: "Salida registrada",
        description: "Has registrado tu salida correctamente",
      })
    } catch (error) {
      Logger.error("Error checking out", error)
      toast({
        title: "Error",
        description: "Error al registrar la salida",
        variant: "destructive",
      })
      setDashboardData(prev => ({ 
        ...prev, 
        attendanceStatus: { ...prev.attendanceStatus, loading: false }
      }))
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return Clock
      case "request":
        return FileText
      case "training":
        return GraduationCap
      default:
        return CheckCircle
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "approved":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
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

  console.log('Rendering dashboard with data:', dashboardData)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-6 glass-effect">
        <h2 className="text-2xl font-bold mb-2">¡Hola, {user.fullName || user.username}!</h2>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad y tareas pendientes.</p>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
        <p><strong>Debug:</strong> Dashboard cargado correctamente</p>
        <p>Loading: {dashboardData.loading ? 'true' : 'false'}</p>
        <p>User: {user.fullName || user.username}</p>
        <p>Role: {user.role}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-stable">
        {/* Attendance Card */}
        <Card className="glass-effect card-hover-animate card-animate stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Asistencia Hoy
            </CardTitle>
            <CardDescription>
              {dashboardData.attendanceStatus.isCheckedIn
                ? `Entrada: ${dashboardData.attendanceStatus.checkInTime ? formatTime(dashboardData.attendanceStatus.checkInTime) : "--:--"}`
                : "No has registrado entrada"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Horas hoy:</span>
              <span className="font-medium">{dashboardData.attendanceStatus.totalHoursToday.toFixed(1)}h</span>
            </div>

            {dashboardData.attendanceStatus.loading ? (
              <Button disabled className="w-full">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </Button>
            ) : dashboardData.attendanceStatus.isCheckedIn ? (
              <Button onClick={handleCheckOut} className="w-full btn-animate" variant="destructive">
                <PauseCircle className="w-4 h-4 mr-2" />
                Registrar Salida
              </Button>
            ) : (
              <Button onClick={handleCheckIn} className="w-full btn-animate">
                <PlayCircle className="w-4 h-4 mr-2" />
                Registrar Entrada
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="glass-effect card-hover-animate card-animate stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-2" />
              Progreso Semanal
            </CardTitle>
            <CardDescription>{dashboardData.attendanceStatus.totalHoursWeek.toFixed(1)} de 40 horas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(dashboardData.attendanceStatus.totalHoursWeek / 40) * 100} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round((dashboardData.attendanceStatus.totalHoursWeek / 40) * 100)}% completado</span>
              <span>{(40 - dashboardData.attendanceStatus.totalHoursWeek).toFixed(1)}h restantes</span>
            </div>
            <Button variant="outline" className="w-full bg-transparent btn-animate">
              <Calendar className="w-4 h-4 mr-2" />
              Ver Calendario
            </Button>
          </CardContent>
        </Card>

        {/* Quick Request */}
        <Card className="glass-effect card-hover-animate card-animate stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-chart-3" />
              Solicitudes
            </CardTitle>
            <CardDescription>Gestiona tus permisos y solicitudes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendientes:</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {dashboardData.pendingRequests}
              </Badge>
            </div>
            <Button className="w-full btn-animate">Nueva Solicitud</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-effect card-hover-animate card-animate stagger-4">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Tus últimas acciones en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay actividad reciente</p>
                <p className="text-sm">Las actividades aparecerán aquí cuando comiences a usar el sistema</p>
              </div>
            ) : (
              dashboardData.recentActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <div className="flex items-center gap-2">
                          {activity.status && (
                            <Badge className={getStatusColor(activity.status)}>
                              {activity.status === "completed" && "Completado"}
                              {activity.status === "pending" && "Pendiente"}
                              {activity.status === "approved" && "Aprobado"}
                              {activity.status === "rejected" && "Rechazado"}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-chart-4" />
              Capacitación en Progreso
            </CardTitle>
            <CardDescription>Cursos y certificaciones disponibles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Seguridad Laboral</span>
                <span className="text-xs text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="w-full" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Comunicación Efectiva</span>
                <span className="text-xs text-muted-foreground">30%</span>
              </div>
              <Progress value={30} className="w-full" />
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              Ver Todos los Cursos
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-chart-5" />
              Recordatorios
            </CardTitle>
            <CardDescription>Tareas y fechas importantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Evaluación de desempeño</p>
                  <p className="text-xs text-muted-foreground">Vence el 25 de enero</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Actualizar información personal</p>
                  <p className="text-xs text-muted-foreground">Opcional</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              Ver Todos los Recordatorios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
