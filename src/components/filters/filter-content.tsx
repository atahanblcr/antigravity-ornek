"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RotateCcw } from "lucide-react"

interface FilterContentProps {
    minPrice: number
    maxPrice: number
    currentMinPrice?: number
    currentMaxPrice?: number
    currentSort?: string
    onClose?: () => void
}

/**
 * Filtreleme Form İçeriği
 * Basit fiyat aralığı ve sıralama filtreleri
 * 
 * ResponsiveFilter içinde kullanılır
 * URL search params ile state yönetimi
 */
export function FilterContent({
    minPrice,
    maxPrice,
    currentMinPrice,
    currentMaxPrice,
    currentSort,
    onClose,
}: FilterContentProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedMinPrice, setSelectedMinPrice] = React.useState<number | undefined>(currentMinPrice)
    const [selectedMaxPrice, setSelectedMaxPrice] = React.useState<number | undefined>(currentMaxPrice)
    const [selectedSort, setSelectedSort] = React.useState<string | undefined>(currentSort)

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        // Fiyat filtreleri
        if (selectedMinPrice !== undefined && selectedMinPrice > minPrice) {
            params.set("minPrice", selectedMinPrice.toString())
        } else {
            params.delete("minPrice")
        }

        if (selectedMaxPrice !== undefined && selectedMaxPrice < maxPrice) {
            params.set("maxPrice", selectedMaxPrice.toString())
        } else {
            params.delete("maxPrice")
        }

        // Sıralama
        if (selectedSort) {
            params.set("sort", selectedSort)
        } else {
            params.delete("sort")
        }

        router.push(`${pathname}?${params.toString()}`)
        onClose?.()
    }

    const clearFilters = () => {
        setSelectedMinPrice(undefined)
        setSelectedMaxPrice(undefined)
        setSelectedSort(undefined)
        router.push(pathname)
        onClose?.()
    }

    const hasFilters = selectedMinPrice !== undefined || selectedMaxPrice !== undefined || selectedSort !== undefined
    const hasChanges =
        selectedMinPrice !== currentMinPrice ||
        selectedMaxPrice !== currentMaxPrice ||
        selectedSort !== currentSort

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
                {/* Fiyat Aralığı */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Fiyat Aralığı</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                                Min Fiyat
                            </Label>
                            <Input
                                id="minPrice"
                                type="number"
                                min={minPrice}
                                max={maxPrice}
                                placeholder={`${minPrice} ₺`}
                                value={selectedMinPrice ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                                    setSelectedMinPrice(value)
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                                Max Fiyat
                            </Label>
                            <Input
                                id="maxPrice"
                                type="number"
                                min={minPrice}
                                max={maxPrice}
                                placeholder={`${maxPrice} ₺`}
                                value={selectedMaxPrice ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                                    setSelectedMaxPrice(value)
                                }}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Fiyat aralığı: {minPrice} ₺ - {maxPrice} ₺
                    </p>
                </div>

                {/* Sıralama */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Sıralama</Label>
                    <div className="flex flex-col gap-2">
                        {sortOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant={selectedSort === option.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedSort(option.value)}
                                className="justify-start"
                            >
                                {option.label}
                            </Button>
                        ))}
                        {selectedSort && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSort(undefined)}
                                className="justify-start text-muted-foreground"
                            >
                                Sıralamayı Kaldır
                            </Button>
                        )}
                    </div>
                </div>
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

const sortOptions = [
    { value: "price_asc", label: "Ucuzdan Pahalıya" },
    { value: "price_desc", label: "Pahalıdan Ucuza" },
    { value: "name_asc", label: "İsme Göre (A-Z)" },
    { value: "name_desc", label: "İsme Göre (Z-A)" },
]
