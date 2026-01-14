"use client"

import * as React from "react"
import { ProductCard } from "@/components/storefront/product-card"

import type { Product } from "@/types"

interface ProductGridProps {
    products: Product[]
}

/**
 * Ürün Grid Bileşeni
 * Reference.md - Mobil-öncelikli tasarım
 */
export const ProductGrid = ({ products }: ProductGridProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.base_price}
                    salePrice={product.sale_price}
                    attributes={product.attributes as Record<string, string>}
                    imageUrl={product.image_url}
                />
            ))}
        </div>
    )
}
