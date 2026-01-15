"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { AddToCartButton } from "@/components/storefront/add-to-cart-button"
import { ShoppingBag } from "lucide-react"
import type { Product } from "@/types"

interface ProductCardProps {
    product: Product
    tenantSlug?: string
}

/**
 * Ürün Kartı Bileşeni
 * Premium Minimalist Tasarım
 */
export const ProductCard = ({ product, tenantSlug }: ProductCardProps) => {
    const hasDiscount = product.sale_price && product.sale_price < product.base_price
    const displayPrice = product.sale_price ?? product.base_price
    const discountPercent = hasDiscount
        ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
        : 0

    const attributes = product.attributes as Record<string, string> | null

    const CardWrapper = tenantSlug
        ? ({ children }: { children: React.ReactNode }) => (
            <Link href={`/${tenantSlug}/product/${product.slug}`} className="block h-full group">{children}</Link>
        )
        : React.Fragment

    return (
        <div className="group h-full flex flex-col transition-all duration-500">
            <CardWrapper>
                {/* Ürün Görseli Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-3">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                    )}

                    {/* Overlay Gradient (Hover) */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                    {/* İndirim Badge - Minimal */}
                    {hasDiscount && (
                        <div className="absolute top-0 left-0 bg-destructive text-white text-[10px] uppercase tracking-wider font-medium px-2 py-1">
                            -{discountPercent}%
                        </div>
                    )}

                    {/* Hızlı Ekle Butonu - Desktop: Slide Up, Mobile: Always visible but subtle */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-100 lg:opacity-100">
                        <div onClick={(e) => e.preventDefault()}>
                            <AddToCartButton product={product} className="w-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white text-black border-none" />
                        </div>
                    </div>
                </div>

                {/* Ürün Bilgileri - Minimal */}
                <div className="flex flex-col gap-1">
                    <h3 className="font-medium text-sm text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">
                        {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                            {displayPrice.toLocaleString("tr-TR")} ₺
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through decoration-destructive/30">
                                {product.base_price.toLocaleString("tr-TR")} ₺
                            </span>
                        )}
                    </div>

                    {/* Özellikler */}
                    {attributes && Object.values(attributes).length > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 truncate uppercase tracking-wide">
                            {Object.values(attributes)[0]}
                        </p>
                    )}
                </div>
            </CardWrapper>
        </div>
    )
}

