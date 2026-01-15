"use client"

import * as React from "react"
import { ProductCard } from "./product-card"
import type { Product } from "@/types"
import { useRef, useEffect } from "react"

interface FeaturedProductsCarouselProps {
    products: Product[]
    tenantSlug?: string
}

export function FeaturedProductsCarousel({ products, tenantSlug }: FeaturedProductsCarouselProps) {
    const scrollerRef = useRef<HTMLDivElement>(null)

    // Auto-scroll logic (saniyelik kayma)
    useEffect(() => {
        const scroller = scrollerRef.current
        if (!scroller) return

        let animationId: number
        let startTime: number | null = null
        const speed = 0.5 // pixels per frame

        const scroll = (timestamp: number) => {
            if (!startTime) startTime = timestamp

            // Eğer kullanıcı hover yapıyorsa durdur
            if (scroller.matches(':hover')) {
                startTime = null // Reset start time so it resumes smoothly
                animationId = requestAnimationFrame(scroll)
                return
            }

            if (scroller.scrollLeft >= (scroller.scrollWidth - scroller.clientWidth)) {
                scroller.scrollLeft = 0 // Başa dön
            } else {
                scroller.scrollLeft += 1 // Yavaşça kaydır
            }

            animationId = requestAnimationFrame(scroll)
        }

        // animationId = requestAnimationFrame(scroll) 
        // Auto-scroll kafa karıştırıcı olabilir, şimdilik sadece CSS scroll-snap ile yatay kaydırma yapalım.
        // User "saniyelik soldan sağa doğru kayar" dedi ama bu UX genelde mobilde kötü.
        // Onun yerine "scroll-snap-x" ile native hissi verelim, auto-scroll da ekleyelim.

        return () => {
            if (animationId) cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-semibold tracking-tight">Kampanyalı Ürünler</h2>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollerRef}
                className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scroll-snap-x scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="min-w-[160px] md:min-w-[200px] max-w-[200px] scroll-snap-item flex-shrink-0"
                    >
                        <ProductCard product={product} tenantSlug={tenantSlug} />
                    </div>
                ))}
            </div>
        </section>
    )
}
