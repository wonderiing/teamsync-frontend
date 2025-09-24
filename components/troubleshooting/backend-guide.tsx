"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, AlertTriangle, RefreshCw } from "lucide-react"
import { useState } from "react"

export function BackendTroubleshootingGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Guía de Solución de Problemas
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="ml-auto h-6 w-6 p-0">
            <RefreshCw className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> No se puede conectar al servidor backend en localhost:8090
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="text-sm font-medium">Pasos para solucionar:</div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  1
                </Badge>
                <div>
                  <div className="font-medium">Verifica que el servidor backend esté ejecutándose</div>
                  <div className="text-muted-foreground mt-1">
                    El servidor debe estar corriendo en <code className="bg-muted px-1 rounded">localhost:8090</code>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  2
                </Badge>
                <div>
                  <div className="font-medium">Verifica los endpoints de la API</div>
                  <div className="text-muted-foreground mt-1">
                    Asegúrate de que los endpoints como{" "}
                    <code className="bg-muted px-1 rounded">/api/v1/auth/login/email</code> estén disponibles
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  3
                </Badge>
                <div>
                  <div className="font-medium">Prueba la conectividad</div>
                  <div className="text-muted-foreground mt-1">
                    Abre <code className="bg-muted px-1 rounded">http://localhost:8090/api/v1/health</code> en tu
                    navegador
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  4
                </Badge>
                <div>
                  <div className="font-medium">Revisa los logs del servidor</div>
                  <div className="text-muted-foreground mt-1">
                    Verifica que no haya errores en la consola del servidor backend
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                <strong>Comandos típicos para iniciar el servidor:</strong>
                <div className="mt-1 space-y-1 font-mono">
                  <div>
                    • <code>npm start</code>
                  </div>
                  <div>
                    • <code>yarn start</code>
                  </div>
                  <div>
                    • <code>java -jar app.jar</code>
                  </div>
                  <div>
                    • <code>python app.py</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
