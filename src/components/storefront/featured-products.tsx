"use client"

import * as React from "react"
import { ProductCard } from "@/components/storefront/product-card"

import type { Product } from "@/types"

interface FeaturedProductsProps {
    products: Product[]
}

/**
 * Öne Çıkan Ürünler Bileşeni
 * HorizontalScrollList ile kullanılır
 */
export const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
    return (
        <>
            {products.map((product) => (
                <div key={product.id} className="w-40 md:w-48">
                    <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.base_price}
                        salePrice={product.sale_price}
                        attributes={product.attributes as Record<string, string>}
                        imageUrl={product.image_url}
                    />
                </div>
            ))}
        </>
    )
}
