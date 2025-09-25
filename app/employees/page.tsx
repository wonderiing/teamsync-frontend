"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, Plus, Search, Mail, Phone, Building, Edit, Trash2, User, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmployeeService, type Employee, type CreateEmployeeData } from "@/lib/employees"
import { CompanyService, type Department } from "@/lib/companies"
import { Logger } from "@/lib/logger"

export default function EmployeesPage() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [newEmployee, setNewEmployee] = useState<CreateEmployeeData>({
    companyId: user?.companyId || 0,
    departmentId: 1,
    fullName: "",
    email: "",
    telephone: "",
    position: "",
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      // Actualizar el companyId del nuevo empleado cuando el usuario esté disponible
      setNewEmployee(prev => ({
        ...prev,
        companyId: user.companyId || 0
      }))
      loadEmployees()
      loadDepartments()
    }
  }, [user])

  const loadEmployees = async () => {
    try {
      setLoadingData(true)
      const response = await EmployeeService.getCompanyEmployees()
      setEmployees(response.content)
      Logger.info("Employees loaded successfully", { count: response.content.length })
    } catch (error) {
      Logger.error("Failed to load employees", error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadDepartments = async () => {
    try {
      if (user?.companyId) {
        const response = await CompanyService.getDepartmentsByCompany(user.companyId)
        setDepartments(response.content)
      }
    } catch (error) {
      Logger.error("Failed to load departments", error)
    }
  }

  const handleCreateEmployee = async () => {
    if (!user?.companyId) {
      Logger.error("Cannot create employee: user has no companyId")
      return
    }

    Logger.info("Creating employee with companyId", { 
      companyId: user.companyId, 
      employeeData: newEmployee 
    })

    try {
      await EmployeeService.createEmployee(newEmployee)
      setShowCreateDialog(false)
      setNewEmployee({
        companyId: user.companyId,
        departmentId: 1,
        fullName: "",
        email: "",
        telephone: "",
        position: "",
      })
      loadEmployees()
    } catch (error) {
      Logger.error("Failed to create employee", error)
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      await EmployeeService.deleteEmployee(id)
      loadEmployees()
    } catch (error) {
      Logger.error("Failed to delete employee", error)
    }
  }

  const filteredEmployees = (employees || []).filter(
    (employee) =>
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  if (user?.role !== "HR" && user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <DashboardSidebar
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
        />
        <div className="flex-1 flex flex-col min-h-screen">
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
          <main className="flex-1 p-6 pb-8">
            <div className="max-w-7xl mx-auto">
              <Card className="glass-effect">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
                  <p className="text-muted-foreground">
                    Solo los usuarios de Recursos Humanos pueden acceder a la gestión de empleados.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
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
              <div className="bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-cyan-500/20 rounded-xl p-6 glass-effect border border-indigo-500/30">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Gestión de Empleados</h1>
                <p className="text-muted-foreground">Administra la información de los empleados de tu empresa</p>
              </div>

              {/* Create Employee Dialog */}
              <div className="flex justify-end">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Empleado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                      <DialogDescription>Completa la información del nuevo empleado</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input
                          id="fullName"
                          value={newEmployee.fullName}
                          onChange={(e) => setNewEmployee((prev) => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Juan Pérez García"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="juan.perez@empresa.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telephone">Teléfono</Label>
                        <Input
                          id="telephone"
                          value={newEmployee.telephone}
                          onChange={(e) => setNewEmployee((prev) => ({ ...prev, telephone: e.target.value }))}
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                      <div>
                        <Label htmlFor="position">Puesto</Label>
                        <Input
                          id="position"
                          value={newEmployee.position}
                          onChange={(e) => setNewEmployee((prev) => ({ ...prev, position: e.target.value }))}
                          placeholder="Desarrollador Frontend"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Departamento</Label>
                        <Select
                          value={newEmployee.departmentId.toString()}
                          onValueChange={(value) =>
                            setNewEmployee((prev) => ({ ...prev, departmentId: Number.parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateEmployee} className="w-full">
                        Agregar Empleado
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empleados por nombre, email o puesto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-effect card-hover stagger-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Empleados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-chart-1" />
                      <span className="text-2xl font-bold">{employees?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect card-hover stagger-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Departamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-chart-2" />
                      <span className="text-2xl font-bold">{departments.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect card-hover stagger-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Empleados Activos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-bold">{(employees || []).filter((e) => e.isActive !== false).length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Employees Table */}
              <Card className="glass-effect card-hover">
                <CardHeader>
                  <CardTitle>Lista de Empleados</CardTitle>
                  <CardDescription>
                    {filteredEmployees.length} empleado{filteredEmployees.length !== 1 ? "s" : ""} encontrado
                    {filteredEmployees.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 animate-pulse">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-3 bg-muted rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay empleados</h3>
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "No se encontraron empleados con los criterios de búsqueda"
                          : "Aún no hay empleados registrados"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Puesto</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.fullName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {employee.email}
                              </div>
                            </TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {employee.telephone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={employee.isActive !== false ? "default" : "secondary"}>
                                {employee.isActive !== false ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}