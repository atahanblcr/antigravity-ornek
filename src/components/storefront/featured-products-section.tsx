"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@/types"

interface FeaturedProductsSectionProps {
    products: Product[]
    title?: string
    description?: string
    tenantSlug?: string
}

/**
 * Auto-Scrolling Infinite Marquee Carousel
 * Continuously scrolls from left to right, pauses on interaction
 */
export function FeaturedProductsSection({
    products,
    title = "🔥 Kampanyalı Ürünler",
    description = "Özel fırsatları kaçırmayın!",
    tenantSlug
}: FeaturedProductsSectionProps) {
    const [isPaused, setIsPaused] = React.useState(false)

    if (!products || products.length === 0) {
        return null
    }

    // Duplicate products for seamless infinite scroll
    const duplicatedProducts = [...products, ...products, ...products]

    return (
        <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
            <div className="container mx-auto px-4 mb-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>
            </div>

            {/* Infinite Marquee Container */}
            <div
                className="relative"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <div className="flex gap-6" style={{
                    animation: isPaused ? 'none' : 'marquee 60s linear infinite',
                    width: 'fit-content'
                }}>
                    {duplicatedProducts.map((product, index) => (
                        <MarqueeProductCard
                            key={`${product.id}-${index}`}
                            product={product}
                            tenantSlug={tenantSlug}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-33.333%);
                    }
                }
            `}</style>
        </section>
    )
}

interface MarqueeProductCardProps {
    product: Product
    tenantSlug?: string
}

/**
 * Minimalist Product Card for Marquee
 * Shows only image, name, and price
 */
const MarqueeProductCard = ({ product, tenantSlug }: MarqueeProductCardProps) => {
    const hasDiscount = !!(product.sale_price && product.sale_price < product.base_price)
    const displayPrice = product.sale_price ?? product.base_price

    const content = (
        <div className="flex-shrink-0 w-[240px] group cursor-pointer">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-secondary/30 mb-3 rounded-lg">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="240px"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-secondary/50">
                        <span className="text-4xl">📦</span>
                    </div>
                )}

                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>

            {/* Product Info - Minimalist */}
            <div className="px-1">
                <h3 className="font-medium text-sm text-foreground mb-1.5 line-clamp-2 group-hover:text-foreground/70 transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-foreground">
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

    if (!tenantSlug) {
        return content
    }

    return (
        <Link href={`/${tenantSlug}/product/${product.slug}`}>
            {content}
        </Link>
    )
}
