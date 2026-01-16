"use client"

import * as React from "react"
import { FeaturedProductsCarousel } from "@/components/storefront/featured-products-carousel"
import { StickyCategoriesSection } from "@/components/storefront/sticky-categories-section"
import { FeaturedProductsSection } from "@/components/storefront/featured-products-section"
import type { Product, Category } from "@/types"

interface StorefrontClientProps {
    categories: Category[]
    featuredProducts: Product[]
    allProducts: Product[]
    tenantSlug: string
}

/**
 * Storefront Client Component
 * Manages category filtering state and renders sections in correct order
 */
export function StorefrontClient({
    categories,
    featuredProducts,
    allProducts,
    tenantSlug,
}: StorefrontClientProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

    // Filter products based on selected category
    const filteredProducts = React.useMemo(() => {
        if (!selectedCategory) {
            return allProducts
        }
        return allProducts.filter(product => product.category_id === selectedCategory)
    }, [selectedCategory, allProducts])

    return (
        <div className="space-y-0">
            {/* 1. Featured Products Carousel */}
            {featuredProducts && featuredProducts.length > 0 && (
                <div className="pb-12">
                    <FeaturedProductsCarousel
                        products={featuredProducts}
                        tenantSlug={tenantSlug}
                    />
                </div>
            )}

            {/* 2. Sticky Categories Section */}
            <StickyCategoriesSection
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            {/* 3. Filtered Products List */}
            <div className="pt-12">
                {filteredProducts && filteredProducts.length > 0 ? (
                    <FeaturedProductsSection
                        products={filteredProducts}
                        title={selectedCategory ? "🎯 Filtrelenmiş Ürünler" : "✨ Tüm Ürünler"}
                        description={
                            selectedCategory
                                ? `${categories.find(c => c.id === selectedCategory)?.name || ''} kategorisindeki ürünler`
                                : "Koleksiyonumuza eklenen en son parçaları keşfedin"
                        }
                        tenantSlug={tenantSlug}
                    />
                ) : (
                    <div className="container mx-auto px-4">
                        <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-2xl">
                            {selectedCategory
                                ? "Bu kategoride henüz ürün bulunmuyor."
                                : "Henüz ürün eklenmemiş."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
