"use client"
import { AppLayout } from "@/components/layout/app-layout"
import { AttendanceTracker } from "@/components/attendance/attendance-tracker"
import { AttendanceHistory } from "@/components/attendance/attendance-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, History, BarChart3 } from "lucide-react"

export default function AttendancePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Asistencia</h1>
          <p className="text-muted-foreground">Registra tu asistencia diaria y consulta tu historial</p>
        </div>

        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Registro
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker">
            <AttendanceTracker />
          </TabsContent>

          <TabsContent value="history">
            <AttendanceHistory />
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Reportes de Asistencia</h3>
              <p className="text-muted-foreground mb-4">
                Próximamente: análisis detallados y reportes de productividad
              </p>
              <Button variant="outline" className="bg-transparent">
                Solicitar Acceso Anticipado
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
