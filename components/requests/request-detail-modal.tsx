"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  RequestService,
  type Request,
  type RequestStatus,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
} from "@/lib/requests"
import { FileText, Clock, User, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SuccessAnimation } from "@/components/ui/success-animation"

interface RequestDetailModalProps {
  request: Request | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
  canManage?: boolean
}

export function RequestDetailModal({ request, isOpen, onClose, onUpdate, canManage = false }: RequestDetailModalProps) {
  const [newStatus, setNewStatus] = useState<RequestStatus>("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { toast } = useToast()

  if (!request) return null

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Por favor selecciona un estado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await RequestService.updateRequestStatus(request.id, {
        status: newStatus,
        reason: reason || undefined,
      })

      // Mostrar animación de éxito
      setSuccessMessage(`Solicitud ${REQUEST_STATUS_LABELS[newStatus].toLowerCase()} exitosamente`)
      setShowSuccessAnimation(true)

      toast({
        title: "✅ Estado actualizado exitosamente",
        description: `La solicitud ha sido ${REQUEST_STATUS_LABELS[newStatus].toLowerCase()}`,
      })

      onUpdate?.()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el estado",
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

  const getTypeBadgeColor = (type: string) => {
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
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Detalle de Solicitud
          </DialogTitle>
          <DialogDescription>ID: {request.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getTypeBadgeColor(request.requestType)}>
                {REQUEST_TYPE_LABELS[request.requestType]}
              </Badge>
              <Badge className={getStatusBadgeColor(request.status)}>{REQUEST_STATUS_LABELS[request.status]}</Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
              <p className="text-muted-foreground">{request.description}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha de creación</p>
                <p className="text-sm text-muted-foreground">{formatDate(request.createdAt)}</p>
              </div>
            </div>

            {request.employeeName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Empleado</p>
                  <p className="text-sm text-muted-foreground">{request.employeeName}</p>
                </div>
              </div>
            )}

            {request.updatedAt !== request.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Última actualización</p>
                  <p className="text-sm text-muted-foreground">{formatDate(request.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Current Response */}
          {request.reason && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Respuesta de HR:</h4>
              <p className="text-sm text-muted-foreground">{request.reason}</p>
            </div>
          )}

          {/* Management Section (HR only) */}
          {canManage && request.status !== "CLOSED" && (
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <h4 className="font-medium">Gestionar Solicitud</h4>

              <div className="space-y-2">
                <Label htmlFor="new-status">Nuevo Estado</Label>
                <Select value={newStatus} onValueChange={(value: RequestStatus) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_REVIEW">En Revisión</SelectItem>
                    <SelectItem value="APPROVED">Aprobar</SelectItem>
                    <SelectItem value="REJECTED">Rechazar</SelectItem>
                    <SelectItem value="CLOSED">Cerrar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Comentarios (opcional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Agrega comentarios sobre la decisión..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cerrar
          </Button>
          {canManage && request.status !== "CLOSED" && (
            <Button onClick={handleStatusUpdate} disabled={loading || !newStatus}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : newStatus === "APPROVED" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar
                </>
              ) : newStatus === "REJECTED" ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </>
              ) : (
                "Actualizar Estado"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        message={successMessage}
        onComplete={() => setShowSuccessAnimation(false)}
      />
    </Dialog>
  )
}
