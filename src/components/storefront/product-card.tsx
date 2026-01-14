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
 * Reference.md Bölüm 4.1 - Glassmorphism estetiği
 * 
 * Mobil-öncelikli tasarım
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
            <Link href={`/${tenantSlug}/product/${product.slug}`}>{children}</Link>
        )
        : React.Fragment

    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg glass-panel">
            <CardWrapper>
                {/* Ürün Görseli */}
                <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                    )}

                    {/* İndirim Etiketi */}
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                            %{discountPercent}
                        </div>
                    )}
                </div>
            </CardWrapper>

            <CardContent className="p-3">
                {/* Ürün Adı */}
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>

                {/* Fiyat ve Sepete Ekle */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-primary">
                            {displayPrice.toLocaleString("tr-TR")} ₺
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                {product.base_price.toLocaleString("tr-TR")} ₺
                            </span>
                        )}
                    </div>

                    {/* Compact Sepete Ekle Butonu */}
                    <AddToCartButton product={product} variant="compact" />
                </div>

                {/* Özellikler */}
                {attributes && Object.keys(attributes).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(attributes).slice(0, 2).map(([key, value]) => (
                            <span
                                key={key}
                                className="text-xs bg-muted px-2 py-0.5 rounded-full"
                            >
                                {value}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

