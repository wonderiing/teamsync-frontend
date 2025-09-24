"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, Plus, Search, Clock, Play, Edit, Trash2, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { TrainingService, type Tutorial, type CreateTutorialData } from "@/lib/training"
import { Logger } from "@/lib/logger"

export default function TrainingPage() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [newTutorial, setNewTutorial] = useState<CreateTutorialData>({
    idCompany: user?.companyId || 1,
    title: "",
    description: "",
    durationMinutes: 0,
    tutorialUrl: "",
    category: "Orientación",
  })

  const categories = [
    "Orientación",
    "Seguridad",
    "Tecnología",
    "Ventas",
    "Atención al Cliente",
    "Liderazgo",
    "Comunicación",
    "Otros",
  ]

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      loadTutorials()
    }
  }, [user])

  const loadTutorials = async () => {
    try {
      setLoadingData(true)
      const response = await TrainingService.getAllTutorials()
      setTutorials(response.content)
      Logger.info("Tutorials loaded successfully", { count: response.content.length })
    } catch (error) {
      Logger.error("Failed to load tutorials", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleCreateTutorial = async () => {
    try {
      await TrainingService.createTutorial(newTutorial)
      setShowCreateDialog(false)
      setNewTutorial({
        idCompany: user?.companyId || 1,
        title: "",
        description: "",
        durationMinutes: 0,
        tutorialUrl: "",
        category: "Orientación",
      })
      loadTutorials()
    } catch (error) {
      Logger.error("Failed to create tutorial", error)
    }
  }

  const handleDeleteTutorial = async (id: number) => {
    try {
      await TrainingService.deleteTutorial(id)
      loadTutorials()
    } catch (error) {
      Logger.error("Failed to delete tutorial", error)
    }
  }

  const filteredTutorials = (tutorials || []).filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "ALL" || tutorial.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
              <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 rounded-xl p-6 glass-effect border border-orange-500/30">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Capacitación y Tutoriales</h1>
                <p className="text-muted-foreground">Gestiona y accede a los recursos de capacitación</p>
              </div>

              {/* Create Tutorial Dialog (only for HR) */}
              {user?.role === "HR" && (
                <div className="flex justify-end">
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Tutorial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Tutorial</DialogTitle>
                        <DialogDescription>Agrega un nuevo tutorial para la capacitación de empleados</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input
                            id="title"
                            value={newTutorial.title}
                            onChange={(e) => setNewTutorial((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Título del tutorial"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={newTutorial.description}
                            onChange={(e) => setNewTutorial((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Descripción del tutorial"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Categoría</Label>
                          <Select
                            value={newTutorial.category}
                            onValueChange={(value) => setNewTutorial((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="duration">Duración (minutos)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={newTutorial.durationMinutes}
                            onChange={(e) =>
                              setNewTutorial((prev) => ({ ...prev, durationMinutes: Number.parseInt(e.target.value) || 0 }))
                            }
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <Label htmlFor="url">URL del Tutorial</Label>
                          <Input
                            id="url"
                            value={newTutorial.tutorialUrl}
                            onChange={(e) => setNewTutorial((prev) => ({ ...prev, tutorialUrl: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>
                        <Button onClick={handleCreateTutorial} className="w-full">
                          Crear Tutorial
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tutoriales..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tutorials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingData ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="glass-effect animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredTutorials.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay tutoriales disponibles</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || selectedCategory !== "ALL"
                        ? "No se encontraron tutoriales con los filtros aplicados"
                        : "Aún no hay tutoriales creados"}
                    </p>
                  </div>
                ) : (
                  filteredTutorials.map((tutorial) => (
                    <Card key={tutorial.id} className="glass-effect hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                            <CardDescription className="mt-1">{tutorial.description}</CardDescription>
                          </div>
                          {user?.role === "HR" && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTutorial(tutorial.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{tutorial.category}</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {tutorial.durationMinutes} min
                            </div>
                          </div>
                          <Button className="w-full" asChild>
                            <a href={tutorial.tutorialUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="w-4 h-4 mr-2" />
                              Ver Tutorial
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}