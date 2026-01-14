"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ResponsiveFilter } from "@/components/filters/responsive-filter"
import { FilterContent, ActiveFilterChips } from "@/components/filters/filter-content"

interface CategoryFiltersClientProps {
    categoryName: string
    productCount: number
    facets: Record<string, { value: string; count: number }[]>
    activeFilters: Record<string, string>
}

/**
 * Kategori Filtreleri Client Bileşeni
 * Reference.md Bölüm 4.2.1 - Drawer (Mobil) / Sheet (Masaüstü) deseni
 */
export function CategoryFiltersClient({
    categoryName,
    productCount,
    facets,
    activeFilters,
}: CategoryFiltersClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [filterOpen, setFilterOpen] = React.useState(false)

    const handleRemoveFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete(key)
        router.push(`${pathname}?${params.toString()}`)
    }

    const activeFilterCount = Object.keys(activeFilters).length

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
                        facets={facets}
                        activeFilters={activeFilters}
                        onClose={() => setFilterOpen(false)}
                    />
                </ResponsiveFilter>
            </div>

            {/* Aktif Filtre Chip'leri */}
            <ActiveFilterChips
                filters={activeFilters}
                onRemove={handleRemoveFilter}
            />
        </div>
    )
}
