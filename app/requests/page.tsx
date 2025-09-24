"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppLayout } from "@/components/layout/app-layout"
import { CreateRequestForm } from "@/components/requests/create-request-form"
import { RequestList } from "@/components/requests/request-list"
import { RequestDetailModal } from "@/components/requests/request-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Request } from "@/lib/requests"
import { Plus, List } from "lucide-react"

export default function RequestsPage() {
  const { user } = useAuth()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRequestCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleRequestUpdated = () => {
    setRefreshKey((prev) => prev + 1)
    setSelectedRequest(null)
  }

  const isHR = user?.role === "HR" || user?.role === "ADMIN"

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Solicitudes</h1>
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
    </AppLayout>
  )
}
