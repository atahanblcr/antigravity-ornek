"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@/types"
import { Sparkles, Star, TrendingUp } from "lucide-react"

interface FeaturedProductsSectionProps {
    products: Product[]
    title?: string
    description?: string
    tenantSlug?: string
}

/**
 * Premium Auto-Scrolling Infinite Marquee Carousel
 * Continuously scrolls with pause on interaction
 * Glassmorphism & gradient effects
 */
export function FeaturedProductsSection({
    products,
    title = "🔥 Kampanyalı Ürünler",
    description = "Özel fırsatları kaçırmayın!",
    tenantSlug
}: FeaturedProductsSectionProps) {
    if (!products || products.length === 0) {
        return null
    }

    return (
        <section className="relative py-16 overflow-hidden">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-blue-600/5" />

            {/* Floating orbs in background */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />

            <div className="container relative mx-auto px-4 mb-10">
                <div className="text-center space-y-4">
                    {/* Animated badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20">
                        <TrendingUp className="h-4 w-4 text-primary animate-bounce" style={{ animationDuration: '2s' }} />
                        <span className="text-sm font-semibold text-primary">Popüler Ürünler</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">{title}</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">{description}</p>

                    {/* Decorative line */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-primary/50 rounded-full" />
                        <Star className="h-4 w-4 text-primary/50" />
                        <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-primary/50 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Grid Container */}
            <div className="container relative mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <MarqueeProductCard
                            key={`${product.id}-${index}`}
                            product={product}
                            tenantSlug={tenantSlug}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

interface MarqueeProductCardProps {
    product: Product
    tenantSlug?: string
}

/**
 * Premium Minimalist Product Card for Marquee
 * Glassmorphism & Hover effects
 */
const MarqueeProductCard = ({ product, tenantSlug }: MarqueeProductCardProps) => {
    const hasDiscount = !!(product.sale_price && product.sale_price < product.base_price)
    const displayPrice = product.sale_price ?? product.base_price
    const discountPercent = hasDiscount
        ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
        : 0

    const imageUrl = product.image_url || ((product.images && product.images.length > 0) ? product.images[0] : null)

    const content = (
        <div className="w-full h-full flex flex-col group cursor-pointer transition-all duration-500 hover:-translate-y-2">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/30 mb-4 rounded-2xl shadow-lg shadow-black/10 group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-blue-600/10">
                        <span className="text-5xl">📦</span>
                    </div>
                )}

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-rose-500/30">
                        <Sparkles className="h-3 w-3" />
                        <span>-{discountPercent}%</span>
                    </div>
                )}
            </div>

            {/* Product Info - Premium Style */}
            <div className="px-1 space-y-2">
                <h3 className="font-semibold text-sm text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">
                        ₺{displayPrice.toLocaleString("tr-TR")}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-muted-foreground/70 line-through">
                            ₺{product.base_price.toLocaleString("tr-TR")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )

    if (!tenantSlug) {
        return content
    }

    return (
        <Link href={`/${tenantSlug}/product/${product.slug}`}>
            {content}
        </Link>
    )
}
