"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

interface CategoryCardProps {
    name: string
    slug: string
    imageUrl?: string
    productCount?: number
    tenantSlug: string
}

/**
 * Premium Kategori Kartı Bileşeni
 * Storefront ana sayfasında kullanılır
 * Glassmorphism & Modern animasyonlar
 */
export const CategoryCard = ({
    name,
    slug,
    imageUrl,
    productCount,
    tenantSlug,
}: CategoryCardProps) => {
    return (
        <Link href={`/${tenantSlug}/${slug}`} className="block group relative overflow-hidden h-44 md:h-64 rounded-3xl shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
            {/* Arka Plan Görseli */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 transition-transform duration-700 group-hover:scale-110">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-blue-500/20 to-indigo-600/30" />
                )}
            </div>

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Mesh gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* İçerik */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="transform transition-all duration-500 group-hover:-translate-y-2">
                    {/* Category Icon */}
                    <div className="mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
                            <Sparkles className="h-3 w-3" />
                            <span>Keşfet</span>
                        </div>
                    </div>

                    <h3 className="font-bold text-2xl md:text-3xl text-white tracking-tight drop-shadow-lg">{name}</h3>

                    {/* Animated underline */}
                    <div className="h-1 w-0 bg-gradient-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-700 ease-out mt-2 rounded-full shadow-lg shadow-primary/50" />

                    {typeof productCount === "number" && (
                        <p className="text-sm text-white/90 mt-3 font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {productCount} Ürün Mevcut
                        </p>
                    )}
                </div>
            </div>

            {/* Floating Arrow Icon */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-white group-hover:text-primary transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                </div>
            </div>

            {/* Corner accent */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/40 to-blue-600/40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
        </Link>
    )
}
