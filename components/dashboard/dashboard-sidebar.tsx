"use client"

import type { User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Clock, FileText, Users, GraduationCap, Settings, LogOut, X, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardSidebarProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export function DashboardSidebar({ user, isOpen, onClose, onLogout }: DashboardSidebarProps) {
  const pathname = usePathname()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "HR":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "EMPLOYEE":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard", roles: ["EMPLOYEE", "HR", "ADMIN"] },
    { icon: Clock, label: "Asistencia", href: "/attendance", roles: ["EMPLOYEE", "HR", "ADMIN"] },
    { icon: FileText, label: "Solicitudes", href: "/requests", roles: ["EMPLOYEE", "HR", "ADMIN"] },
    { icon: Users, label: "Empleados", href: "/employees", roles: ["HR", "ADMIN"] },
    { icon: GraduationCap, label: "Capacitación", href: "/training", roles: ["EMPLOYEE", "HR", "ADMIN"] },
    { icon: Building2, label: "Empresas", href: "/companies", roles: ["ADMIN"] },
    { icon: Shield, label: "Administración", href: "/admin", roles: ["ADMIN"] },
    { icon: Settings, label: "Configuración", href: "/settings", roles: ["EMPLOYEE", "HR", "ADMIN"] },
  ]

  const availableMenuItems = menuItems.filter((item) => item.roles.includes(user.role))

  return (
    <div
      className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border sidebar-smooth lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">TeamSync</span>
        </div>
        <Button variant="ghost" size="sm" className="lg:hidden btn-animate" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{user.fullName || user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Badge className={getRoleBadgeColor(user.role)}>
          {user.role === "EMPLOYEE" && "Empleado"}
          {user.role === "HR" && "Recursos Humanos"}
          {user.role === "ADMIN" && "Administrador"}
        </Badge>
      </div>

      <nav className="p-4 space-y-2">
        {availableMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 btn-animate ${isActive ? "bg-primary/10 text-primary" : "hover:bg-accent/50"}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="outline" className="w-full justify-start gap-3 bg-transparent btn-animate" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
