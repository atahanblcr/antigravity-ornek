"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showFirstLast?: boolean
}

/**
 * Pagination Bileşeni
 */
export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = false,
}: PaginationProps) {
    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages

    // Görünür sayfa numaralarını hesapla
    const getVisiblePages = () => {
        const delta = 2
        const range: number[] = []
        const rangeWithDots: (number | string)[] = []

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...")
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages)
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        return rangeWithDots
    }

    if (totalPages <= 1) return null

    return (
        <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
            {showFirstLast && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={!canGoPrevious}
                >
                    İlk
                </Button>
            )}

            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
                {getVisiblePages().map((page, index) =>
                    typeof page === "string" ? (
                        <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                            {page}
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </Button>
                    )
                )}
            </div>

            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {showFirstLast && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canGoNext}
                >
                    Son
                </Button>
            )}
        </nav>
    )
}

/**
 * Sayfa Bilgisi Bileşeni
 */
export function PageInfo({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
}: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}) {
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <p className="text-sm text-muted-foreground">
            {totalItems} öğeden {start}-{end} arası gösteriliyor
        </p>
    )
}
