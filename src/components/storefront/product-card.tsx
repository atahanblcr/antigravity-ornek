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
            <Link href={`/${tenantSlug}/product/${product.slug}`} className="block h-full">{children}</Link>
        )
        : React.Fragment

    return (
        <Card className="group h-full flex flex-col overflow-hidden border-border/50 bg-card hover:border-primary/20 hover:shadow-xl transition-all duration-300">
            <CardWrapper>
                {/* Ürün Görseli */}
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary/50">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* İndirim Etiketi */}
                    {hasDiscount && (
                        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            %{discountPercent} İndirim
                        </div>
                    )}

                    {/* Hızlı Ekle Butonu - Desktop hover'da görünür, mobilde her zaman */}
                    <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div onClick={(e) => e.preventDefault()}>
                            <AddToCartButton product={product} variant="icon" />
                        </div>
                    </div>
                </div>

                <CardContent className="flex-1 p-4 flex flex-col gap-2">
                    {/* Ürün Adı */}
                    <h3 className="font-medium text-sm leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Fiyat */}
                    <div className="mt-auto pt-2 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                            {displayPrice.toLocaleString("tr-TR")} ₺
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                                {product.base_price.toLocaleString("tr-TR")} ₺
                            </span>
                        )}
                    </div>

                    {/* Özellikler - Sadece ilk özellik */}
                    {attributes && Object.values(attributes).length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                            {Object.values(attributes)[0]}
                        </p>
                    )}
                </CardContent>
            </CardWrapper>
        </Card>
    )
}

