"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Plus, List } from "lucide-react"
import { AddDepartmentForm } from "@/components/departments/add-department-form"
import { DepartmentsList } from "@/components/departments/departments-list"

export default function DepartmentsPage() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Verificar permisos - Solo ADMIN puede acceder según los endpoints
  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Building2 className="h-16 w-16 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold">Acceso Denegado</h2>
          <p className="text-muted-foreground text-center">
            Solo los administradores pueden gestionar departamentos
          </p>
          <Button onClick={() => router.push("/dashboard")} className="bg-transparent">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <DashboardSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
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

        {/* Page content */}
        <main className="flex-1 p-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl p-6 glass-effect border border-blue-500/30">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Gestión de Departamentos
                </h1>
                <p className="text-muted-foreground">
                  Administra todos los departamentos del sistema
                </p>
              </div>

              <Tabs defaultValue="list" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Ver Departamentos
                  </TabsTrigger>
                  <TabsTrigger value="add" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Departamento
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <DepartmentsList />
                </TabsContent>

                <TabsContent value="add">
                  <AddDepartmentForm onSuccess={() => {
                    // Aquí podrías agregar lógica para actualizar la lista
                    // Por ahora, el usuario puede cambiar a la pestaña "Ver Departamentos"
                  }} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
