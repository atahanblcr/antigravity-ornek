"use client"

import * as React from "react"
import { ProductCard } from "@/components/storefront/product-card"

import type { Product } from "@/types"

interface FeaturedProductsProps {
    products: Product[]
    tenantSlug?: string
}

/**
 * Öne Çıkan Ürünler Bileşeni
 * HorizontalScrollList ile kullanılır
 */
export const FeaturedProducts = ({ products, tenantSlug }: FeaturedProductsProps) => {
    return (
        <>
            {products.map((product) => (
                <div key={product.id} className="w-40 md:w-48">
                    <ProductCard product={product} tenantSlug={tenantSlug} />
                </div>
            ))}
        </>
    )
}

