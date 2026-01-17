"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Sparkles, Heart } from "lucide-react"
import type { Product } from "@/types"

interface ProductCardProps {
    product: Product
    tenantSlug?: string
}

/**
 * Ürün Kartı Bileşeni
 * Premium Vitrin Tasarımı - Glassmorphism & Animasyonlar
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
    const imageUrl = product.image_url || ((product.images && product.images.length > 0) ? product.images[0] : null)

    return (
        <div className="h-full flex flex-col transition-all duration-500 group-hover:-translate-y-1">
            {/* Ürün Görseli Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/30 mb-4 rounded-2xl shadow-lg shadow-black/5 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-500">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/5 to-blue-600/5">
                        <ShoppingBag className="h-16 w-16 text-primary/20" />
                    </div>
                )}

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Floating Action Button */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg hover:bg-primary hover:text-white transition-colors duration-300">
                        <Heart className="h-4 w-4" />
                    </div>
                </div>

                {/* İndirim Badge - Premium Gradient */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse" style={{ animationDuration: '3s' }}>
                        <Sparkles className="h-3 w-3" />
                        <span>-{discountPercent}%</span>
                    </div>
                )}

                {/* New Badge for products without discount */}
                {!hasDiscount && product.is_featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/30">
                        <span>Yeni</span>
                    </div>
                )}
            </div>

            {/* Ürün Bilgileri - Premium Style */}
            <div className="flex flex-col gap-2 px-1">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2.5">
                    <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        ₺{displayPrice.toLocaleString("tr-TR")}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-muted-foreground/70 line-through font-medium">
                            ₺{product.base_price.toLocaleString("tr-TR")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
