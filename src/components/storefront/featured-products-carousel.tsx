"use client"

import * as React from "react"
import type { Product } from "@/types"
import Image from "next/image"
import Link from "next/link"

interface FeaturedProductsCarouselProps {
    products: Product[]
    tenantSlug?: string
}

export function FeaturedProductsCarousel({ products, tenantSlug }: FeaturedProductsCarouselProps) {
    return (
        <section className="relative w-full overflow-hidden py-12 bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="mb-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                    Öne Çıkan Ürünler
                </h2>
                <p className="mt-2 text-slate-600">Sürekli güncellenen kampanyalı ürünlerimiz</p>
            </div>

            {/* Grid Container */}
            <div className="container relative mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <div key={`${product.id}-${index}`} className="flex justify-center">
                            <MinimalistProductCard
                                product={product}
                                tenantSlug={tenantSlug}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

interface MinimalistProductCardProps {
    product: Product
    tenantSlug?: string
}

function MinimalistProductCard({ product, tenantSlug }: MinimalistProductCardProps) {
    const href = tenantSlug ? `/${tenantSlug}/product/${product.slug}` : `/product/${product.slug}`
    const imageUrl = product.images?.[0] || product.image_url || "/placeholder-product.png"

    // Use sale_price if available, otherwise use base_price
    const displayPrice = product.sale_price || product.base_price
    const hasDiscount = product.sale_price && product.sale_price < product.base_price

    return (
        <Link
            href={href}
            className="group/card w-full block"
        >
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />

                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />


                    {/* Discount badge on image */}
                    {hasDiscount && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            %{Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)} İndirim
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover/card:text-blue-600 transition-colors">
                        {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">
                            ₺{displayPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-slate-400 line-through">
                                ₺{product.base_price.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
