"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { AppLayout } from "@/components/layout/app-layout"
import { LogViewer } from "@/components/debug/log-viewer"
import { BackendStatus } from "@/components/debug/backend-status"
import { BackendTroubleshootingGuide } from "@/components/troubleshooting/backend-guide"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando TeamSync...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showRegister ? (
            <RegisterForm onSuccess={() => setShowRegister(false)} onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
        <div className="fixed top-4 right-4 w-80">
          <div className="space-y-2">
            <BackendStatus />
            <BackendTroubleshootingGuide />
            <LogViewer />
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <Dashboard user={user} />
    </AppLayout>
  )
}
