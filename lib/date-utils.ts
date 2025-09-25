/**
 * Utilidades para manejo de fechas en la aplicación
 * Asegura que las fechas se manejen de manera consistente con el backend
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando timezone local
 * Evita problemas de timezone al enviar fechas al backend
 */
export function getCurrentDateString(): string {
  const now = new Date()
  return now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0')
}

/**
 * Formatea una fecha Date a string YYYY-MM-DD
 */
export function formatDateToString(date: Date): string {
  return date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0')
}

/**
 * Obtiene el inicio de la semana (lunes) para la fecha dada
 */
export function getStartOfWeek(date: Date): Date {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay()) // Lunes de esta semana
  return startOfWeek
}

/**
 * Obtiene el final de la semana (domingo) para la fecha dada
 */
export function getEndOfWeek(date: Date): Date {
  const startOfWeek = getStartOfWeek(date)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // Domingo de esta semana
  return endOfWeek
}

/**
 * Obtiene el inicio del mes para la fecha dada
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Obtiene el final del mes para la fecha dada
 */
export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * Formatea una fecha string del backend para mostrar en la UI
 * Maneja diferentes formatos de fecha del backend
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return ""
  
  try {
    // El backend devuelve fechas en formato "YYYY-MM-DD"
    const date = new Date(dateString + "T00:00:00")
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString)
      return "Fecha inválida"
    }
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString)
    return "Fecha inválida"
  }
}

/**
 * Formatea una hora string del backend para mostrar en la UI
 * Maneja diferentes formatos de hora del backend
 */
export function formatTimeForDisplay(timeString: string): string {
  if (!timeString) return ""
  
  try {
    // El backend devuelve horas en formato "HH:MM:SS"
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeString.split(":")
      return `${hours}:${minutes}`
    } else if (timeString.includes("T")) {
      // Es formato ISO completo
      const date = new Date(timeString)
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return timeString
    }
  } catch (error) {
    console.error("Error formatting time:", error, "Input:", timeString)
    return "Hora inválida"
  }
}
