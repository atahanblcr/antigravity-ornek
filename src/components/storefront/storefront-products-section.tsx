"use client"

import * as React from "react"
import { CategoryChip } from "@/components/storefront/category-chip"
import { FeaturedProductsCarousel } from "@/components/storefront/featured-products-carousel"
import { FeaturedProductsSection } from "@/components/storefront/featured-products-section"
import type { Product, Category } from "@/types"
import { Sparkles, Package } from "lucide-react"

interface StorefrontProductsSectionProps {
    categories: Category[]
    featuredProducts: Product[]
    allProducts: Product[]
    tenantSlug: string
}

/**
 * Premium Storefront Ürünler Bölümü (Client Component)
 * Kategori filtreleme ve ürün listeleme işlevselliği
 * Glassmorphism & Modern animasyonlar
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
        <div className="space-y-16">
            {/* Kampanyalı Ürünler - Carousel */}
            {featuredProducts && featuredProducts.length > 0 && (
                <FeaturedProductsCarousel
                    products={featuredProducts}
                    tenantSlug={tenantSlug}
                />
            )}

            {/* Kategori Horizontal Scroll */}
            {categories && categories.length > 0 && (
                <section className="relative py-8">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

                    <div className="container relative mx-auto px-4 space-y-6">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center gap-2 text-primary/80 mb-2">
                                <Package className="h-5 w-5" />
                                <span className="text-sm font-semibold uppercase tracking-widest">Kategoriler</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">Koleksiyonlar</span>
                            </h2>
                            <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-blue-600 mx-auto rounded-full shadow-lg shadow-primary/20" />
                        </div>

                        {/* Horizontal Scroll Container */}
                        <div className="relative py-2">
                            {/* Premium Gradient Fade Edges */}
                            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                            {/* Scrollable Categories */}
                            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth px-4">
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
                <div className="relative py-16 mx-4">
                    {/* Empty state with premium styling */}
                    <div className="relative text-center py-16 bg-gradient-to-br from-primary/5 via-background to-blue-600/5 rounded-3xl border border-primary/10 shadow-lg shadow-black/5 overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />

                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 mb-4">
                                <Package className="h-8 w-8 text-primary/60" />
                            </div>
                            <p className="text-lg text-muted-foreground font-medium">
                                {selectedCategory
                                    ? "Bu kategoride henüz ürün bulunmuyor."
                                    : "Henüz ürün eklenmemiş."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
