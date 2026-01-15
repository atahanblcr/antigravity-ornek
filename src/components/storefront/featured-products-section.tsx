"use client"

import * as React from "react"
import Link from "next/link"
import { Product } from "@/types"
import { ProductCard } from "./product-card"

interface FeaturedProductsSectionProps {
    products: Product[]
    title?: string
    description?: string
}

/**
 * Ürün Listesi Bölümü (Kampanyalı veya Yeni Ürünler)
 */
export function FeaturedProductsSection({
    products,
    title = "🔥 Kampanyalı Ürünler",
    description = "Özel fırsatları kaçırmayın!"
}: FeaturedProductsSectionProps) {
    if (!products || products.length === 0) {
        return null
    }

    return (
        <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-background">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">{title}</h2>
                        <p className="text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Horizontal scroll on mobile, grid on desktop */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4">
                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.slice(0, 8).map((product) => (
                            <div
                                key={product.id}
                                className="flex-shrink-0 w-[280px] md:w-auto"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>

                {products.length > 8 && (
                    <div className="text-center mt-8">
                        <Link
                            href="/products?featured=true"
                            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Tüm Kampanyalı Ürünleri Gör
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
