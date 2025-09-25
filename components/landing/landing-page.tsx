"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Users, 
  Clock, 
  FileText, 
  GraduationCap, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Play
} from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { HRRegisterForm } from "@/components/auth/hr-register-form"

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showHRRegister, setShowHRRegister] = useState(false)

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Control de Asistencia",
      description: "Registra y gestiona la asistencia de tus empleados de forma inteligente"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Gestión de Solicitudes",
      description: "Administra permisos, vacaciones y solicitudes de manera eficiente"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Capacitación",
      description: "Organiza y supervisa programas de entrenamiento para tu equipo"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Reportes Avanzados",
      description: "Obtén insights detallados sobre el rendimiento de tu organización"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestión de Empleados",
      description: "Mantén un registro completo y actualizado de tu personal"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Seguridad",
      description: "Protege los datos de tu empresa con las mejores prácticas de seguridad"
    }
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Directora de RRHH",
      company: "TechCorp",
      content: "TeamSync ha revolucionado la forma en que gestionamos a nuestros empleados. Es intuitivo y muy eficiente.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Gerente General",
      company: "InnovateLab",
      content: "La plataforma más completa que hemos usado. Los reportes nos ayudan a tomar mejores decisiones.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Coordinadora de Operaciones",
      company: "Global Solutions",
      content: "Excelente herramienta para el control de asistencia. Nuestro equipo la adoptó inmediatamente.",
      rating: 5
    }
  ]

  if (showAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showHRRegister ? (
            <HRRegisterForm 
              onSuccess={() => setShowAuth(false)} 
              onSwitchToLogin={() => {
                setShowHRRegister(false)
                setShowRegister(false)
              }}
              onSwitchToEmployeeRegister={() => {
                setShowHRRegister(false)
                setShowRegister(true)
              }}
            />
          ) : showRegister ? (
            <RegisterForm 
              onSuccess={() => setShowAuth(false)} 
              onSwitchToLogin={() => setShowRegister(false)} 
            />
          ) : (
            <LoginForm 
              onSwitchToRegister={() => setShowRegister(true)}
              onSuccess={() => setShowAuth(false)}
            />
          )}
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowAuth(false)
                setShowRegister(false)
                setShowHRRegister(false)
              }}
              className="text-foreground hover:text-muted-foreground"
            >
              ← Volver a la página principal
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-white">TeamSync</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowAuth(true)}
              className="text-white hover:text-gray-300"
            >
              Iniciar Sesión
            </Button>
            <Button 
              onClick={() => {
                setShowAuth(true)
                setShowRegister(true)
              }}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Empleado
            </Button>
            <Button 
              onClick={() => {
                setShowAuth(true)
                setShowHRRegister(true)
              }}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              RRHH
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Zap className="w-4 h-4 mr-2" />
            Nueva versión disponible
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Gestiona tu equipo
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              como nunca antes
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            TeamSync es la plataforma integral de gestión empresarial que necesitas. 
            Control de asistencia, solicitudes, capacitación y más, todo en un solo lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => {
                setShowAuth(true)
                setShowRegister(true)
              }}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Empleado
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              onClick={() => {
                setShowAuth(true)
                setShowHRRegister(true)
              }}
              className="bg-purple-600 text-white hover:bg-purple-700 text-lg px-8 py-6"
            >
              RRHH
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Play className="mr-2 w-5 h-5" />
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Todo lo que necesitas para gestionar tu empresa
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Herramientas poderosas diseñadas para simplificar la administración de recursos humanos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-300">
              Miles de empresas confían en TeamSync
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                ¿Listo para transformar tu empresa?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Únete a miles de empresas que ya están usando TeamSync para optimizar su gestión
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => {
                    setShowAuth(true)
                    setShowRegister(true)
                  }}
                  className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
                >
                  Empleado
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => {
                    setShowAuth(true)
                    setShowHRRegister(true)
                  }}
                  className="bg-purple-600 text-white hover:bg-purple-700 text-lg px-8 py-6"
                >
                  RRHH
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  Contactar Ventas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xl font-bold text-white">TeamSync</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 TeamSync. Todos los derechos reservados.</p>
              <p className="text-sm mt-1">Hecho con ❤️ para empresas modernas</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
