"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AttendanceService, type AttendanceRecord } from "@/lib/attendance"
import { Clock, PlayCircle, PauseCircle, Calendar, MapPin, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentDateString, formatDateToString, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, formatTimeForDisplay } from "@/lib/date-utils"
import { useAuth } from "@/hooks/use-auth"

export function AttendanceTracker() {
  const { user } = useAuth()
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [todayHours, setTodayHours] = useState(0)
  const [weeklyHours, setWeeklyHours] = useState(0)
  const [monthlyHours, setMonthlyHours] = useState(0)
  const [dailyAverage, setDailyAverage] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already checked in today and load stats
    checkTodayStatus()
    loadAttendanceStats()
  }, [])

  const getPersonalAttendances = async (startDate: string, endDate: string, page: number = 0, size: number = 10) => {
    if (user?.role === "HR" || user?.role === "ADMIN") {
      // Para usuarios HR/ADMIN, usar endpoint de empresa pero filtrar por su ID
      console.log("HR/ADMIN user - using company endpoint as workaround")
      const response = await AttendanceService.getCompanyAttendancesByRange(startDate, endDate, page, 100)
      
      // Filtrar solo las asistencias del usuario actual
      if (user.employeeId) {
        response.content = response.content.filter(record => record.employeeId === user.employeeId)
      }
      
      return response
    } else {
      // Para empleados normales, usar endpoint personal
      return await AttendanceService.getMyAttendancesByRange(startDate, endDate, page, size)
    }
  }

  const checkTodayStatus = async () => {
    try {
      setLoadingStatus(true)
      // Usar fecha local para evitar problemas de timezone
      const today = getCurrentDateString()
      
      console.log('Checking attendance for date:', today)
      console.log('Current time:', new Date().toString())
      console.log('Current timezone offset:', new Date().getTimezoneOffset())
      console.log('User role:', user?.role, 'Employee ID:', user?.employeeId)
      
      const response = await getPersonalAttendances(today, today, 0, 10)

      if (response.content.length > 0) {
        // Buscar el registro más reciente del día
        const mostRecentRecord = response.content[0]
        setCurrentRecord(mostRecentRecord)
        setIsCheckedIn(!mostRecentRecord.checkOutTime)
        
        // Calcular horas trabajadas hoy usando nuestro cálculo
        const todayHours = response.content.reduce((total, record) => {
          const backendHours = record.totalHours || 0
          const calculatedHours = record.checkOutTime 
            ? calculateWorkHours(record.checkInTime, record.checkOutTime)
            : 0
          
          // Usar nuestro cálculo si es diferente al del backend (puede ser más preciso)
          return total + (calculatedHours > 0 ? calculatedHours : backendHours)
        }, 0)
        setTodayHours(todayHours)
      } else {
        // No hay registros para hoy, resetear estado
        setCurrentRecord(null)
        setIsCheckedIn(false)
        setTodayHours(0)
      }
    } catch (error) {
      console.error("Error checking today status:", error)
      // En caso de error, resetear estado
      setCurrentRecord(null)
      setIsCheckedIn(false)
      setTodayHours(0)
    } finally {
      setLoadingStatus(false)
    }
  }

  const loadAttendanceStats = async () => {
    try {
      setLoadingStats(true)
      const today = new Date()
      
      // Calcular fechas usando las utilidades
      const startOfWeek = getStartOfWeek(today)
      const endOfWeek = getEndOfWeek(today)
      const startOfMonth = getStartOfMonth(today)
      const endOfMonth = getEndOfMonth(today)

      // Cargar datos de la semana
      const weekResponse = await getPersonalAttendances(
        formatDateToString(startOfWeek),
        formatDateToString(endOfWeek),
        0,
        100
      )

      // Cargar datos del mes
      const monthResponse = await getPersonalAttendances(
        formatDateToString(startOfMonth),
        formatDateToString(endOfMonth),
        0,
        100
      )

      // Calcular horas semanales usando nuestro cálculo
      const weekHours = weekResponse.content.reduce((total, record) => {
        const backendHours = record.totalHours || 0
        const calculatedHours = record.checkOutTime 
          ? calculateWorkHours(record.checkInTime, record.checkOutTime)
          : 0
        
        // Usar nuestro cálculo si es diferente al del backend (puede ser más preciso)
        return total + (calculatedHours > 0 ? calculatedHours : backendHours)
      }, 0)

      // Calcular horas mensuales usando nuestro cálculo
      const monthHours = monthResponse.content.reduce((total, record) => {
        const backendHours = record.totalHours || 0
        const calculatedHours = record.checkOutTime 
          ? calculateWorkHours(record.checkInTime, record.checkOutTime)
          : 0
        
        // Usar nuestro cálculo si es diferente al del backend (puede ser más preciso)
        return total + (calculatedHours > 0 ? calculatedHours : backendHours)
      }, 0)

      // Calcular promedio diario (días trabajados en el mes)
      const workingDays = monthResponse.content.length
      const avgDaily = workingDays > 0 ? monthHours / workingDays : 0

      setWeeklyHours(weekHours)
      setMonthlyHours(monthHours)
      setDailyAverage(avgDaily)

    } catch (error) {
      console.error("Error loading attendance stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const record = await AttendanceService.checkIn(notes)
      setCurrentRecord(record)
      setIsCheckedIn(true)
      setNotes("")

      // Recargar estado actual y estadísticas
      checkTodayStatus()
      loadAttendanceStats()

      toast({
        title: "Entrada registrada",
        description: `Entrada registrada a las ${formatTime(record.checkInTime)}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al registrar entrada",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const record = await AttendanceService.checkOut(notes)
      setCurrentRecord(record)
      setIsCheckedIn(false)
      setTodayHours(record.totalHours || 0)
      setNotes("")

      // Recargar estado actual y estadísticas
      checkTodayStatus()
      loadAttendanceStats()

      toast({
        title: "Salida registrada",
        description: `Salida registrada a las ${formatTime(record.checkOutTime || "")}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al registrar salida",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatTime = formatTimeForDisplay

  const calculateWorkHours = (checkInTime: string, checkOutTime: string): number => {
    try {
      // Si no hay checkOutTime, no se pueden calcular horas
      if (!checkOutTime) return 0

      // Parsear las horas de entrada y salida
      const [checkInHour, checkInMin] = checkInTime.split(':').map(Number)
      const [checkOutHour, checkOutMin] = checkOutTime.split(':').map(Number)

      let totalMinutes = 0

      // Si la salida es al día siguiente (checkOutHour < checkInHour)
      if (checkOutHour < checkInHour || (checkOutHour === checkInHour && checkOutMin < checkInMin)) {
        // Calcular minutos hasta medianoche
        const minutesToMidnight = (24 - checkInHour) * 60 - checkInMin
        // Calcular minutos desde medianoche hasta la salida
        const minutesFromMidnight = checkOutHour * 60 + checkOutMin
        totalMinutes = minutesToMidnight + minutesFromMidnight
      } else {
        // Mismo día
        const checkInMinutes = checkInHour * 60 + checkInMin
        const checkOutMinutes = checkOutHour * 60 + checkOutMin
        totalMinutes = checkOutMinutes - checkInMinutes
      }

      // Convertir a horas
      return totalMinutes / 60
    } catch (error) {
      console.error("Error calculating work hours:", error)
      return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Estado Actual
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isCheckedIn ? "bg-green-400" : "bg-gray-400"}`} />
              <span className="font-medium">{isCheckedIn ? "Trabajando" : "Fuera de horario"}</span>
            </div>
            <Badge
              className={
                isCheckedIn
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }
            >
              {isCheckedIn ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Hora actual</p>
              <p className="text-xl font-mono font-bold">{getCurrentTime()}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Horas hoy</p>
              <p className="text-xl font-mono font-bold">{todayHours.toFixed(1)}h</p>
            </div>
          </div>

          {loadingStatus ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Cargando estado actual...</span>
            </div>
          ) : currentRecord ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Entrada:</span>
                <span className="font-medium">{formatTime(currentRecord.checkInTime)}</span>
              </div>
              {currentRecord.checkOutTime && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Salida:</span>
                    <span className="font-medium">{formatTime(currentRecord.checkOutTime)}</span>
                  </div>
                  {/* Mostrar si cruzó medianoche */}
                  {(() => {
                    const [checkInHour] = currentRecord.checkInTime.split(':').map(Number)
                    const [checkOutHour] = currentRecord.checkOutTime.split(':').map(Number)
                    const crossedMidnight = checkOutHour < checkInHour
                    const calculatedHours = calculateWorkHours(currentRecord.checkInTime, currentRecord.checkOutTime)
                    
                    return (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Horas trabajadas:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{calculatedHours.toFixed(1)}h</span>
                            {crossedMidnight && (
                              <Badge variant="secondary" className="text-xs">
                                +1 día
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-sm text-muted-foreground">No hay registro de asistencia para hoy</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check In/Out Form */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCheckedIn ? (
              <PauseCircle className="w-5 h-5 text-red-400" />
            ) : (
              <PlayCircle className="w-5 h-5 text-green-400" />
            )}
            {isCheckedIn ? "Registrar Salida" : "Registrar Entrada"}
          </CardTitle>
          <CardDescription>
            {isCheckedIn
              ? "Registra tu salida y cualquier nota sobre tu jornada"
              : "Registra tu entrada para comenzar tu jornada laboral"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder={
                isCheckedIn
                  ? "Ej: Completé todas las tareas asignadas, reunión con el equipo de marketing..."
                  : "Ej: Trabajando desde casa, llegué temprano para preparar la presentación..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Ubicación detectada automáticamente</span>
          </div>

          {isCheckedIn ? (
            <Button onClick={handleCheckOut} className="w-full" variant="destructive" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando salida...
                </>
              ) : (
                <>
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Registrar Salida
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleCheckIn} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando entrada...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Registrar Entrada
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Esta semana</p>
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <p className="font-bold">{weeklyHours.toFixed(1)}h</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio diario</p>
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <p className="font-bold">{dailyAverage.toFixed(1)}h</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este mes</p>
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <p className="font-bold">{monthlyHours.toFixed(1)}h</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
