"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  RequestService,
  type Request,
  type RequestType,
  type RequestStatus,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
} from "@/lib/requests"
import { FileText, Filter, ChevronLeft, ChevronRight, Eye, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RequestListProps {
  isHR?: boolean
  onRequestSelect?: (request: Request) => void
}

export function RequestList({ isHR = false, onRequestSelect }: RequestListProps) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all")
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [currentPage, typeFilter, statusFilter, isHR])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const response = isHR
        ? await RequestService.getCompanyRequests(
            currentPage,
            10,
            typeFilter === "all" ? undefined : typeFilter,
            statusFilter === "all" ? undefined : statusFilter,
          )
        : await RequestService.getMyRequests(
            currentPage,
            10,
            typeFilter === "all" ? undefined : typeFilter,
            statusFilter === "all" ? undefined : statusFilter,
          )

      setRequests(response.content)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar las solicitudes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: RequestStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "IN_REVIEW":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "RECEIVED":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "CLOSED":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeBadgeColor = (type: RequestType) => {
    switch (type) {
      case "VACATIONS":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "REIMBURSEMENT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "CERTIFICATE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "INCIDENT":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "INFORMATION":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const clearFilters = () => {
    setTypeFilter("all")
    setStatusFilter("all")
    setCurrentPage(0)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtros
          </CardTitle>
          <CardDescription>Filtra las solicitudes por tipo y estado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Solicitud</label>
              <Select value={typeFilter} onValueChange={(value: RequestType | "all") => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(REQUEST_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={(value: RequestStatus | "all") => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(REQUEST_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadRequests} size="sm">
              Aplicar Filtros
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm" className="bg-transparent">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request List */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {isHR ? "Solicitudes de la Empresa" : "Mis Solicitudes"}
          </CardTitle>
          <CardDescription>
            {Array.isArray(requests) && requests.length > 0
              ? `Mostrando ${requests.length} solicitudes`
              : "No hay solicitudes para mostrar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted/50 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : Array.isArray(requests) && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeBadgeColor(request.requestType)}>
                          {REQUEST_TYPE_LABELS[request.requestType]}
                        </Badge>
                        <Badge className={getStatusBadgeColor(request.status)}>
                          {REQUEST_STATUS_LABELS[request.status]}
                        </Badge>
                      </div>
                      <h3 className="font-medium mb-1">{request.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                      {isHR && request.employeeName && (
                        <p className="text-sm text-muted-foreground mt-1">Empleado: {request.employeeName}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(request.createdAt)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRequestSelect?.(request)}
                        className="bg-transparent"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm">
                        <span className="font-medium">Respuesta: </span>
                        <span className="text-muted-foreground">{request.reason}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay solicitudes</p>
              <p className="text-sm">
                {isHR ? "No hay solicitudes de empleados" : "Aún no has creado ninguna solicitud"}
              </p>
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
