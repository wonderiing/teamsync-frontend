"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { useAuth } from "@/hooks/use-auth"
import { Logger } from "@/lib/logger"
import { Users, Plus, Search, Mail, Phone, Building, Edit, Trash2, User } from "lucide-react"

export default function EmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [newEmployee, setNewEmployee] = useState<CreateEmployeeData>({
    companyId: user?.companyId || 1,
    departmentId: 1,
    fullName: "",
    email: "",
    telephone: "",
    position: "",
  })

  useEffect(() => {
    loadEmployees()
    loadDepartments()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const response = await EmployeeService.getCompanyEmployees()
      setEmployees(response.content)
      Logger.info("Employees loaded successfully", { count: response.content.length })
    } catch (error) {
      Logger.error("Failed to load employees", error)
    } finally {
      setLoading(false)
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
    try {
      await EmployeeService.createEmployee(newEmployee)
      setShowCreateDialog(false)
      setNewEmployee({
        companyId: user?.companyId || 1,
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

  if (user?.role !== "HR" && user?.role !== "ADMIN") {
    return (
      <AppLayout>
        <Card className="glass-effect">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground">
              Solo los usuarios de Recursos Humanos pueden acceder a la gestión de empleados.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
          <p className="text-muted-foreground">Administra la información de los empleados de tu empresa</p>
        </div>
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
          {loading ? (
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
    </AppLayout>
  )
}
