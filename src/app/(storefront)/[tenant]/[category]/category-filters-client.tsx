"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ResponsiveFilter } from "@/components/filters/responsive-filter"
import { FilterContent } from "@/components/filters/filter-content"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CategoryFiltersClientProps {
    categoryName: string
    productCount: number
    minPrice: number
    maxPrice: number
    currentMinPrice?: number
    currentMaxPrice?: number
    currentSort?: string
}

/**
 * Kategori Filtreleri Client Bileşeni
 * Basit fiyat aralığı ve sıralama filtreleri
 */
export function CategoryFiltersClient({
    categoryName,
    productCount,
    minPrice,
    maxPrice,
    currentMinPrice,
    currentMaxPrice,
    currentSort,
}: CategoryFiltersClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleClearFilters = () => {
        router.push(pathname)
    }

    const hasActiveFilters = currentMinPrice !== undefined || currentMaxPrice !== undefined || currentSort !== undefined
    const activeFilterCount = [currentMinPrice, currentMaxPrice, currentSort].filter(Boolean).length

    return (
        <div className="space-y-4">
            {/* Başlık ve Filtre Butonu */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{categoryName}</h1>
                    <p className="text-muted-foreground text-sm">
                        {productCount} ürün
                        {activeFilterCount > 0 && ` (${activeFilterCount} filtre aktif)`}
                    </p>
                </div>
                <ResponsiveFilter
                    title="Filtreler"
                    triggerLabel={activeFilterCount > 0 ? `Filtre (${activeFilterCount})` : "Filtrele"}
                >
                    <FilterContent
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        currentMinPrice={currentMinPrice}
                        currentMaxPrice={currentMaxPrice}
                        currentSort={currentSort}
                    />
                </ResponsiveFilter>
            </div>

            {/* Aktif Filtre Chip'leri */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 items-center">
                    {currentMinPrice !== undefined && (
                        <FilterChip
                            label={`Min: ${currentMinPrice} ₺`}
                            onRemove={() => {
                                const params = new URLSearchParams(searchParams.toString())
                                params.delete("minPrice")
                                router.push(`${pathname}?${params.toString()}`)
                            }}
                        />
                    )}
                    {currentMaxPrice !== undefined && (
                        <FilterChip
                            label={`Max: ${currentMaxPrice} ₺`}
                            onRemove={() => {
                                const params = new URLSearchParams(searchParams.toString())
                                params.delete("maxPrice")
                                router.push(`${pathname}?${params.toString()}`)
                            }}
                        />
                    )}
                    {currentSort && (
                        <FilterChip
                            label={getSortLabel(currentSort)}
                            onRemove={() => {
                                const params = new URLSearchParams(searchParams.toString())
                                params.delete("sort")
                                router.push(`${pathname}?${params.toString()}`)
                            }}
                        />
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-7 text-xs"
                    >
                        Tümünü Temizle
                    </Button>
                </div>
            )}
        </div>
    )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <Button
            variant="secondary"
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={onRemove}
        >
            {label}
            <X className="h-3 w-3" />
        </Button>
    )
}

function getSortLabel(sort: string): string {
    const labels: Record<string, string> = {
        price_asc: "Ucuzdan Pahalıya",
        price_desc: "Pahalıdan Ucuza",
        name_asc: "A-Z",
        name_desc: "Z-A",
    }
    return labels[sort] || sort
}
