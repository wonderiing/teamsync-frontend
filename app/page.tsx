"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LandingPage } from "@/components/landing/landing-page"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirigir al dashboard si está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace("/dashboard")
    }
  }, [loading, isAuthenticated, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-gray-300">Cargando...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-gray-300">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return <LandingPage />
}
