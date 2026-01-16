"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import type { Product } from "@/types"

interface ProductCardProps {
    product: Product
    tenantSlug?: string
}

/**
 * Ürün Kartı Bileşeni
 * Minimal Vitrin Tasarımı - Apple Tarzı
 */
export const ProductCard = ({ product, tenantSlug }: ProductCardProps) => {
    const hasDiscount = !!(product.sale_price && product.sale_price < product.base_price)
    const displayPrice = product.sale_price ?? product.base_price
    const discountPercent = hasDiscount
        ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
        : 0

    // Eğer tenantSlug yoksa, kartı tıklanabilir yapma
    if (!tenantSlug) {
        return <ProductCardContent product={product} hasDiscount={hasDiscount} displayPrice={displayPrice} discountPercent={discountPercent} />
    }

    return (
        <Link
            href={`/${tenantSlug}/product/${product.slug}`}
            className="block h-full group"
        >
            <ProductCardContent
                product={product}
                hasDiscount={hasDiscount}
                displayPrice={displayPrice}
                discountPercent={discountPercent}
            />
        </Link>
    )
}

interface ProductCardContentProps {
    product: Product
    hasDiscount: boolean
    displayPrice: number
    discountPercent: number
}

const ProductCardContent = ({ product, hasDiscount, displayPrice, discountPercent }: ProductCardContentProps) => {
    return (
        <div className="h-full flex flex-col transition-all duration-300">
            {/* Ürün Görseli Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30 mb-3 rounded-lg">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                )}

                {/* Subtle Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                {/* İndirim Badge - Minimal */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-destructive text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        -{discountPercent}%
                    </div>
                )}
            </div>

            {/* Ürün Bilgileri - Ultra Minimal */}
            <div className="flex flex-col gap-1.5 px-1">
                <h3 className="font-medium text-sm text-foreground group-hover:text-foreground/70 transition-colors duration-300 line-clamp-2">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-foreground">
                        ₺{displayPrice.toLocaleString("tr-TR")}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                            ₺{product.base_price.toLocaleString("tr-TR")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
