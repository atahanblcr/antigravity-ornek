"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface CategoryCardProps {
    name: string
    slug: string
    imageUrl?: string
    productCount?: number
    tenantSlug: string
}

/**
 * Kategori Kartı Bileşeni
 * Storefront ana sayfasında kullanılır
 */
export const CategoryCard = ({
    name,
    slug,
    imageUrl,
    productCount,
    tenantSlug,
}: CategoryCardProps) => {
    return (
        <Link href={`/${tenantSlug}/${slug}`} className="block group relative overflow-hidden h-40 md:h-56">
            {/* Arka Plan Görseli */}
            <div className="absolute inset-0 bg-secondary transition-transform duration-700 group-hover:scale-105">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200" />
                )}
            </div>

            {/* Gradient Overlay - Always visible but darker on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

            {/* İçerik */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                    <h3 className="font-bold text-xl text-white tracking-tight">{name}</h3>
                    <div className="h-0.5 w-0 bg-white group-hover:w-full transition-all duration-500 ease-out mt-1 opacity-80" />

                    {typeof productCount === "number" && (
                        <p className="text-xs text-white/80 mt-2 font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            {productCount} Ürün
                        </p>
                    )}
                </div>
            </div>

            {/* İkon - Top Right */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ChevronRight className="h-5 w-5 text-white" />
            </div>
        </Link>
    )
}
