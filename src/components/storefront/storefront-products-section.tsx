"use client"

import * as React from "react"
import { CategoryChip } from "@/components/storefront/category-chip"
import { FeaturedProductsCarousel } from "@/components/storefront/featured-products-carousel"
import { FeaturedProductsSection } from "@/components/storefront/featured-products-section"
import type { Product, Category } from "@/types"

interface StorefrontProductsSectionProps {
    categories: Category[]
    featuredProducts: Product[]
    allProducts: Product[]
    tenantSlug: string
}

/**
 * Storefront Ürünler Bölümü (Client Component)
 * Kategori filtreleme ve ürün listeleme işlevselliği
 */
export const StorefrontProductsSection = ({
    categories,
    featuredProducts,
    allProducts,
    tenantSlug,
}: StorefrontProductsSectionProps) => {
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

    // Filtrelenmiş ürünler
    const filteredProducts = React.useMemo(() => {
        if (!selectedCategory) {
            return allProducts
        }
        return allProducts.filter(product => product.category_id === selectedCategory)
    }, [selectedCategory, allProducts])

    return (
        <div className="space-y-12">
            {/* Kampanyalı Ürünler - Carousel */}
            {featuredProducts && featuredProducts.length > 0 && (
                <FeaturedProductsCarousel
                    products={featuredProducts}
                    tenantSlug={tenantSlug}
                />
            )}

            {/* Kategori Horizontal Scroll */}
            {categories && categories.length > 0 && (
                <section className="space-y-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Koleksiyonlar</h2>
                        <div className="h-1 w-20 bg-primary mx-auto rounded-full opacity-20" />
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="relative px-4">
                        {/* Gradient Fade Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                        {/* Scrollable Categories */}
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
                            {/* "Tümü" Butonu */}
                            <CategoryChip
                                name="Tümü"
                                slug="all"
                                isActive={selectedCategory === null}
                                onClick={() => setSelectedCategory(null)}
                            />

                            {categories.map((category) => (
                                <CategoryChip
                                    key={category.id}
                                    name={category.name}
                                    slug={category.slug}
                                    isActive={selectedCategory === category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Filtrelenmiş Ürünler */}
            {filteredProducts && filteredProducts.length > 0 ? (
                <FeaturedProductsSection
                    products={filteredProducts}
                    title={selectedCategory ? "🎯 Filtrelenmiş Ürünler" : "✨ Yeni Ürünler"}
                    description={
                        selectedCategory
                            ? `${categories.find(c => c.id === selectedCategory)?.name || ''} kategorisindeki ürünler`
                            : "Koleksiyonumuza eklenen en son parçaları keşfedin"
                    }
                    tenantSlug={tenantSlug}
                />
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-2xl mx-4">
                    {selectedCategory
                        ? "Bu kategoride henüz ürün bulunmuyor."
                        : "Henüz ürün eklenmemiş."}
                </div>
            )}
        </div>
    )
}
