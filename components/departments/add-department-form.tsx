"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DepartmentService } from "@/lib/departments"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Building2, Plus, Loader2 } from "lucide-react"

interface AddDepartmentFormProps {
  onSuccess?: () => void
}

export function AddDepartmentForm({ onSuccess }: AddDepartmentFormProps) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    fullName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!form.fullName.trim()) {
      setError("El nombre del departamento es requerido")
      setLoading(false)
      return
    }

    if (!user?.companyId) {
      setError("No se pudo determinar la empresa del usuario")
      setLoading(false)
      return
    }

    try {
      await DepartmentService.createDepartment(
        form.fullName.trim(),
        user.companyId
      )

      toast({
        title: "✅ Departamento creado exitosamente",
        description: `El departamento "${form.fullName}" ha sido creado correctamente`,
      })

      // Reset form
      setForm({
        fullName: "",
      })

      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear departamento"
      setError(message)
      toast({
        title: "❌ Error al crear departamento",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Usar automáticamente el companyId del token del usuario

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Agregar Nuevo Departamento
        </CardTitle>
        <CardDescription>
          Crea un nuevo departamento para organizar mejor tu empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department-name">Nombre del Departamento</Label>
            <Input
              id="department-name"
              type="text"
              placeholder="Ej: Recursos Humanos, Ventas, Desarrollo..."
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando departamento...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Crear Departamento
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
