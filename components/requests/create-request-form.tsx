"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RequestService, type RequestType, REQUEST_TYPE_LABELS } from "@/lib/requests"
import { FileText, Loader2, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SuccessAnimation } from "@/components/ui/success-animation"

interface CreateRequestFormProps {
  onSuccess?: () => void
}

export function CreateRequestForm({ onSuccess }: CreateRequestFormProps) {
  const [formData, setFormData] = useState({
    requestType: "" as RequestType,
    title: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.requestType || !formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const newRequest = await RequestService.createRequest(formData)
      
      // Mostrar animación de éxito
      setSuccessMessage(`Solicitud "${formData.title}" creada exitosamente`)
      setShowSuccessAnimation(true)
      
      toast({
        title: "✅ Solicitud creada exitosamente",
        description: "Tu solicitud ha sido enviada y está siendo procesada",
      })
      setFormData({ requestType: "" as RequestType, title: "", description: "" })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la solicitud",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPlaceholderText = (type: RequestType) => {
    switch (type) {
      case "VACATIONS":
        return "Ej: Solicito vacaciones del 20 al 30 de enero para descanso familiar..."
      case "REIMBURSEMENT":
        return "Ej: Solicito reembolso por gastos de viaje de $450 por reunión con cliente..."
      case "CERTIFICATE":
        return "Ej: Necesito constancia de trabajo para trámite bancario..."
      case "INCIDENT":
        return "Ej: Reporto incidente con equipo de cómputo que requiere reparación..."
      case "INFORMATION":
        return "Ej: Solicito información sobre políticas de trabajo remoto..."
      default:
        return "Describe detalladamente tu solicitud..."
    }
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Nueva Solicitud
        </CardTitle>
        <CardDescription>Crea una nueva solicitud para recursos humanos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="request-type">Tipo de Solicitud *</Label>
            <Select
              value={formData.requestType}
              onValueChange={(value: RequestType) => setFormData((prev) => ({ ...prev, requestType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de solicitud" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REQUEST_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Título breve de tu solicitud"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder={formData.requestType ? getPlaceholderText(formData.requestType) : "Describe tu solicitud..."}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              required
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información importante:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tu solicitud será revisada por el equipo de recursos humanos</li>
              <li>• Recibirás una notificación cuando haya actualizaciones</li>
              <li>• Proporciona toda la información necesaria para agilizar el proceso</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </form>
      </CardContent>

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        message={successMessage}
        onComplete={() => setShowSuccessAnimation(false)}
      />
    </Card>
  )
}
