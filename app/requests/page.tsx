"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, Plus, List } from "lucide-react"
import { CreateRequestForm } from "@/components/requests/create-request-form"
import { RequestList } from "@/components/requests/request-list"
import { RequestDetailModal } from "@/components/requests/request-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Request } from "@/lib/requests"

export default function RequestsPage() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/")
    }
  }, [loading, isAuthenticated, router])

  const handleRequestCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleRequestUpdated = () => {
    setRefreshKey((prev) => prev + 1)
    setSelectedRequest(null)
  }

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

  const isHR = user?.role === "HR" || user?.role === "ADMIN"

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
              <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-xl p-6 glass-effect border border-purple-500/30">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">Gestión de Solicitudes</h1>
                <p className="text-muted-foreground">
                  {isHR ? "Gestiona las solicitudes de los empleados" : "Crea y gestiona tus solicitudes"}
                </p>
              </div>

              <Tabs defaultValue={isHR ? "manage" : "create"} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                  {!isHR && (
                    <TabsTrigger value="create" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nueva Solicitud
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="manage" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    {isHR ? "Gestionar Solicitudes" : "Mis Solicitudes"}
                  </TabsTrigger>
                </TabsList>

                {!isHR && (
                  <TabsContent value="create">
                    <CreateRequestForm onSuccess={handleRequestCreated} />
                  </TabsContent>
                )}

                <TabsContent value="manage" key={refreshKey}>
                  <RequestList isHR={isHR} onRequestSelect={setSelectedRequest} />
                </TabsContent>
              </Tabs>

              <RequestDetailModal
                request={selectedRequest}
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onUpdate={handleRequestUpdated}
                canManage={isHR}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}