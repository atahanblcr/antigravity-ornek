"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, RotateCcw } from "lucide-react"

interface FacetValue {
    value: string
    count: number
}

interface FilterContentProps {
    facets: Record<string, FacetValue[]>
    activeFilters: Record<string, string>
    onClose?: () => void
}

/**
 * Filtreleme Form İçeriği
 * Reference.md Bölüm 3.4 - Fasetli Arama
 * 
 * ResponsiveFilter içinde kullanılır
 * URL search params ile state yönetimi
 */
export function FilterContent({
    facets,
    activeFilters,
    onClose,
}: FilterContentProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedFilters, setSelectedFilters] = React.useState<Record<string, string>>(activeFilters)

    const handleFilterChange = (key: string, value: string) => {
        setSelectedFilters((prev) => {
            const newFilters = { ...prev }
            if (newFilters[key] === value) {
                delete newFilters[key]
            } else {
                newFilters[key] = value
            }
            return newFilters
        })
    }

    const applyFilters = () => {
        const params = new URLSearchParams()
        Object.entries(selectedFilters).forEach(([key, value]) => {
            params.set(key, value)
        })
        router.push(`${pathname}?${params.toString()}`)
        onClose?.()
    }

    const clearFilters = () => {
        setSelectedFilters({})
        router.push(pathname)
        onClose?.()
    }

    const hasFilters = Object.keys(selectedFilters).length > 0
    const hasChanges = JSON.stringify(selectedFilters) !== JSON.stringify(activeFilters)

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
                {Object.entries(facets).map(([attributeKey, values]) => (
                    <div key={attributeKey} className="space-y-3">
                        <Label className="text-sm font-medium capitalize">
                            {attributeKey}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {values.map(({ value, count }) => {
                                const isSelected = selectedFilters[attributeKey] === value
                                return (
                                    <Button
                                        key={value}
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleFilterChange(attributeKey, value)}
                                        className="gap-1"
                                    >
                                        {value}
                                        <span className="text-xs opacity-70">({count})</span>
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {Object.keys(facets).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Bu kategoride filtrelenebilir özellik bulunamadı.
                    </p>
                )}
            </div>

            {/* Aksiyon Butonları */}
            <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t mt-6 space-y-2">
                <Button
                    onClick={applyFilters}
                    disabled={!hasChanges}
                    className="w-full"
                >
                    Filtreleri Uygula
                </Button>
                {hasFilters && (
                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Filtreleri Temizle
                    </Button>
                )}
            </div>
        </div>
    )
}

/**
 * Aktif Filtreleri Gösteren Chip'ler
 */
export function ActiveFilterChips({
    filters,
    onRemove,
}: {
    filters: Record<string, string>
    onRemove: (key: string) => void
}) {
    if (Object.keys(filters).length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
                <Button
                    key={key}
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7 text-xs"
                    onClick={() => onRemove(key)}
                >
                    <span className="capitalize">{key}:</span> {value}
                    <X className="h-3 w-3" />
                </Button>
            ))}
        </div>
    )
}
