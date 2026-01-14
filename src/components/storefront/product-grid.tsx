"use client"

import * as React from "react"
import { ProductCard } from "@/components/storefront/product-card"

import type { Product } from "@/types"

interface ProductGridProps {
    products: Product[]
    tenantSlug?: string
}

/**
 * Ürün Grid Bileşeni
 * Reference.md - Mobil-öncelikli tasarım
 */
export const ProductGrid = ({ products, tenantSlug }: ProductGridProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    tenantSlug={tenantSlug}
                />
            ))}
        </div>
    )
}

