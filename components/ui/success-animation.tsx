"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"

interface SuccessAnimationProps {
  show: boolean
  onComplete?: () => void
  message?: string
  duration?: number
}

export function SuccessAnimation({ 
  show, 
  onComplete, 
  message = "¡Operación exitosa!", 
  duration = 2000 
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-green-500/30 rounded-lg p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-green-500/30 animate-ping"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-400 mb-1">¡Éxito!</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="w-full bg-green-500/20 rounded-full h-1 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
