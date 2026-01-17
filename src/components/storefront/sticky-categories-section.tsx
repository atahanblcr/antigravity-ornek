"use client"

import * as React from "react"
import { CategoryChip } from "@/components/storefront/category-chip"
import type { Category } from "@/types"
import { Layers } from "lucide-react"

interface StickyCategoriesSectionProps {
    categories: Category[]
    selectedCategory: string | null
    onCategoryChange: (categoryId: string | null) => void
}

/**
 * Premium Sticky Categories Section
 * Horizontal scrolling category filters with glassmorphism
 */
export function StickyCategoriesSection({
    categories,
    selectedCategory,
    onCategoryChange,
}: StickyCategoriesSectionProps) {
    if (!categories || categories.length === 0) {
        return null
    }

    return (
        <section
            className="sticky top-[72px] z-40 bg-gradient-to-b from-white/95 via-white/90 to-white/80 backdrop-blur-2xl border-b border-primary/10 shadow-lg shadow-black/5"
            style={{
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-blue-600/3 pointer-events-none" />

            <div className="container relative mx-auto px-4 py-5">
                <div className="space-y-4">
                    {/* Section Title with Icon */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 text-primary/80">
                            <Layers className="h-5 w-5" />
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Koleksiyonlar</h2>
                        </div>
                        <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-600 mx-auto rounded-full shadow-lg shadow-primary/30" />
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="relative">
                        {/* Premium Gradient Fade Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                        {/* Scrollable Categories */}
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth px-4">
                            {/* "Tümü" Button */}
                            <CategoryChip
                                name="Tümü"
                                slug="all"
                                isActive={selectedCategory === null}
                                onClick={() => onCategoryChange(null)}
                            />

                            {categories.map((category) => (
                                <CategoryChip
                                    key={category.id}
                                    name={category.name}
                                    slug={category.slug}
                                    isActive={selectedCategory === category.id}
                                    onClick={() => onCategoryChange(category.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
