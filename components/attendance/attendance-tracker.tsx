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

export function AttendanceTracker() {
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [todayHours, setTodayHours] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already checked in today
    checkTodayStatus()
  }, [])

  const checkTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await AttendanceService.getMyAttendancesByRange(today, today, 0, 1)

      if (response.content.length > 0) {
        const record = response.content[0]
        setCurrentRecord(record)
        setIsCheckedIn(!record.checkOutTime)
        setTodayHours(record.totalHours || 0)
      }
    } catch (error) {
      console.error("Error checking today status:", error)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const record = await AttendanceService.checkIn(notes)
      setCurrentRecord(record)
      setIsCheckedIn(true)
      setNotes("")

      toast({
        title: "Entrada registrada",
        description: `Entrada registrada a las ${new Date(record.checkInTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
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

      toast({
        title: "Salida registrada",
        description: `Salida registrada a las ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
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

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

          {currentRecord && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Entrada:</span>
                <span className="font-medium">{formatTime(currentRecord.checkInTime)}</span>
              </div>
              {currentRecord.checkOutTime && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Salida:</span>
                  <span className="font-medium">{formatTime(currentRecord.checkOutTime)}</span>
                </div>
              )}
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
                <p className="font-bold">32.5h</p>
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
                <p className="font-bold">8.1h</p>
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
                <p className="font-bold">142h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
