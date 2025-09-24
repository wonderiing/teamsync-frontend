"use client"

import type { User } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { EmployeeDashboard } from "./employee-dashboard"
import { HRDashboard } from "./hr-dashboard"
import { AdminDashboard } from "./admin-dashboard"

interface DashboardProps {
  user: User | null
}

export function Dashboard({ user }: DashboardProps) {
  if (!user) return null

  const renderDashboardContent = () => {
    switch (user.role) {
      case "EMPLOYEE":
        return <EmployeeDashboard user={user} />
      case "HR":
        return <HRDashboard user={user} />
      case "ADMIN":
        return <AdminDashboard user={user} />
      default:
        return <EmployeeDashboard user={user} />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta, {user.fullName || user.username}</p>
      </div>
      {renderDashboardContent()}
    </div>
  )
}
