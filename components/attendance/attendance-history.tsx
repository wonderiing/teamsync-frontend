"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AttendanceService, type AttendanceRecord, type AttendanceResponse } from "@/lib/attendance"
import { useAuth } from "@/hooks/use-auth"
import { Calendar, Clock, FileText, ChevronLeft, ChevronRight, Download, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AttendanceHistory() {
  const { user } = useAuth()
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [viewMode, setViewMode] = useState<"personal" | "company">("personal")
  const { toast } = useToast()

  useEffect(() => {
    loadAttendances()
  }, [currentPage, viewMode])

  const loadAttendances = async () => {
    setLoading(true)
    try {
      let response: AttendanceResponse

      if (viewMode === "company" && (user?.role === "HR" || user?.role === "ADMIN")) {
        // Mostrar asistencias de toda la empresa
        if (startDate && endDate) {
          response = await AttendanceService.getCompanyAttendancesByRange(startDate, endDate, currentPage, 10)
        } else {
          response = await AttendanceService.getCompanyAttendances(currentPage, 10)
        }
      } else {
        // Mostrar asistencias personales
        if (startDate && endDate) {
          response = await AttendanceService.getMyAttendancesByRange(startDate, endDate, currentPage, 10)
        } else {
          response = await AttendanceService.getMyAttendances(currentPage, 10)
        }
      }

      setAttendances(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar el historial de asistencias",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilter = () => {
    setCurrentPage(0)
    loadAttendances()
  }

  const clearDateFilter = () => {
    setStartDate("")
    setEndDate("")
    setCurrentPage(0)
    loadAttendances()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    // El backend devuelve fechas en formato "YYYY-MM-DD"
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    // El backend devuelve horas en formato "HH:MM:SS"
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  const calculateHours = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return 0
    
    // Convertir las horas del formato "HH:MM:SS" a minutos desde medianoche
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number)
      return hours * 60 + minutes
    }
    
    const startMinutes = timeToMinutes(checkIn)
    const endMinutes = timeToMinutes(checkOut)
    
    // Calcular la diferencia en horas
    const diffMinutes = endMinutes - startMinutes
    const hours = diffMinutes / 60
    
    return Math.round(hours * 10) / 10
  }

  const getStatusBadge = (record: AttendanceRecord) => {
    if (!record.checkOutTime) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En progreso</Badge>
    }

    // Si tiene salida registrada, considerarlo completo
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completo</Badge>
  }

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      {(user?.role === "HR" || user?.role === "ADMIN") && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Vista de Asistencias
            </CardTitle>
            <CardDescription>Selecciona qué asistencias quieres ver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "personal" ? "default" : "outline"}
                onClick={() => setViewMode("personal")}
                className="bg-transparent"
              >
                Mis Asistencias
              </Button>
              <Button
                variant={viewMode === "company" ? "default" : "outline"}
                onClick={() => setViewMode("company")}
                className="bg-transparent"
              >
                Asistencias de la Empresa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="glass-effect card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Filtros de Fecha
          </CardTitle>
          <CardDescription>
            {viewMode === "company" 
              ? "Filtra las asistencias de la empresa por rango de fechas"
              : "Filtra tu historial de asistencias por rango de fechas"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha de inicio</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha de fin</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDateFilter} disabled={!startDate || !endDate}>
              Aplicar Filtro
            </Button>
            <Button variant="outline" onClick={clearDateFilter} className="bg-transparent">
              Limpiar
            </Button>
            <Button variant="outline" className="bg-transparent ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card className="glass-effect card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {viewMode === "company" ? "Asistencias de la Empresa" : "Historial de Asistencias"}
          </CardTitle>
          <CardDescription>
            {(attendances?.length ?? 0) > 0 ? `Mostrando ${attendances.length} registros` : "No hay registros para mostrar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted/50 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : attendances.length > 0 ? (
            <div className="space-y-4">
              {attendances.map((record) => (
                <div key={record.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(record.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {viewMode === "company" && record.employeeName 
                            ? `${record.employeeName} (ID: ${record.employeeId}) - ${record.checkOutTime ? "Jornada completada" : "Jornada en progreso"}`
                            : viewMode === "company" 
                            ? `ID: ${record.employeeId} - ${record.checkOutTime ? "Jornada completada" : "Jornada en progreso"}`
                            : record.checkOutTime
                            ? `Jornada completada`
                            : "Jornada en progreso"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(record)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Entrada: {formatTime(record.checkInTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span className="text-sm">
                        Salida: {record.checkOutTime ? formatTime(record.checkOutTime) : "--:--"}
                      </span>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="flex items-start gap-2 pt-2 border-t border-border">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de asistencia</p>
              <p className="text-sm">Los registros aparecerán aquí cuando comiences a usar el sistema</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Página {currentPage + 1} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
