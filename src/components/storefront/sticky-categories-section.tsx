"use client"

import * as React from "react"
import { CategoryChip } from "@/components/storefront/category-chip"
import type { Category } from "@/types"

interface StickyCategoriesSectionProps {
    categories: Category[]
    selectedCategory: string | null
    onCategoryChange: (categoryId: string | null) => void
}

/**
 * Sticky Categories Section
 * Horizontal scrolling category filters that stick to the top when scrolling
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
            className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm"
            style={{
                // Ensure smooth transitions
                transition: "all 0.3s ease-in-out"
            }}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="space-y-3">
                    {/* Section Title */}
                    <div className="text-center space-y-1">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Koleksiyonlar</h2>
                        <div className="h-0.5 w-16 bg-primary mx-auto rounded-full opacity-30" />
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="relative">
                        {/* Gradient Fade Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                        {/* Scrollable Categories */}
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth px-2">
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
