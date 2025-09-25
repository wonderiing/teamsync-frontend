"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DepartmentService, type Department } from "@/lib/departments"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Building2, Trash2, Loader2, Users } from "lucide-react"
import { formatDateForDisplay } from "@/lib/date-utils"
import { Pagination } from "@/components/ui/pagination"
import { SuccessAnimation } from "@/components/ui/success-animation"

export function DepartmentsList() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { toast } = useToast()

  const loadDepartments = async () => {
    setLoading(true)
    try {

      let response

      if (user?.role === "ADMIN") {
        // ADMIN puede ver departamentos de su empresa usando companyId del token
        if (user.companyId) {
          response = await DepartmentService.getDepartmentsByCompany(user.companyId, currentPage, 10)
        } else {
          throw new Error("No se pudo determinar la empresa del usuario ADMIN")
        }
      } else {
        throw new Error("Solo los administradores pueden ver departamentos")
      }

      setDepartments(response.content)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error loading departments:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar departamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadDepartments()
    }
  }, [currentPage, user])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el departamento "${name}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      await DepartmentService.deleteDepartment(id)
      
      // Mostrar animación de éxito
      setSuccessMessage(`Departamento "${name}" eliminado exitosamente`)
      setShowSuccessAnimation(true)
      
      // También mostrar toast para feedback inmediato
      toast({
        title: "✅ Departamento eliminado exitosamente",
        description: `El departamento "${name}" ha sido eliminado correctamente`,
      })
      
      loadDepartments() // Recargar la lista
    } catch (error) {
      toast({
        title: "❌ Error al eliminar departamento",
        description: error instanceof Error ? error.message : "Error al eliminar departamento",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }


  const getCompanyName = (companyId: number) => {
    const companies: Record<number, string> = {
      1: "Empresa Demo 1",
      2: "Empresa Demo 2",
      3: "Empresa Demo 3",
    }
    return companies[companyId] || `Empresa ${companyId}`
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Departamentos
        </CardTitle>
        <CardDescription>
          Gestiona todos los departamentos del sistema
        </CardDescription>
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              try {
                const testDept = await DepartmentService.createDepartment(
                  `Departamento Test ${new Date().toLocaleTimeString()}`, 
                  user?.companyId || 1
                )
                
                // Mostrar animación de éxito
                setSuccessMessage(`Departamento "${testDept.fullName}" creado exitosamente`)
                setShowSuccessAnimation(true)
                
                toast({
                  title: "✅ Departamento creado exitosamente",
                  description: `Se creó: ${testDept.fullName}`,
                })
                loadDepartments() // Recargar la lista
              } catch (error) {
                toast({
                  title: "❌ Error al crear departamento",
                  description: error instanceof Error ? error.message : "Error al crear departamento de prueba",
                  variant: "destructive",
                })
              }
            }}
            className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/10"
          >
            🧪 Crear Departamento de Prueba
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : departments.length > 0 ? (
          <div className="space-y-4">
            {departments.map((department) => (
              <div key={department.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{department.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.role === "ADMIN" 
                          ? `${getCompanyName(department.companyId)} - ID: ${department.companyId}`
                          : `Departamento ID: ${department.id}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Activo
                    </Badge>
                    {/* Solo ADMIN puede eliminar */}
                    {user?.role === "ADMIN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(department.id, department.fullName)}
                        disabled={deletingId === department.id}
                        className="bg-transparent text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        {deletingId === department.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {department.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Creado: {formatDateForDisplay(department.createdAt.split(' ')[0])}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay departamentos registrados</p>
            <p className="text-sm">Los departamentos aparecerán aquí cuando se creen</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 pt-4 border-t border-border"
        />
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
