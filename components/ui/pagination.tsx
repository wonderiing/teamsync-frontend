"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showInfo?: boolean
  className?: string
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showInfo = true,
  className = ""
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showInfo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Página {currentPage + 1} de {totalPages}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Anterior</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            if (page === '...') {
              return (
                <Button key={`dots-${index}`} variant="outline" size="sm" disabled className="bg-transparent">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage + 1

            return (
              <Button
                key={pageNumber}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber - 1)}
                className={isActive ? "" : "bg-transparent"}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="bg-transparent"
        >
          <span className="hidden sm:inline mr-1">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}