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
        <Link href={`/${tenantSlug}/${slug}`}>
            <Card className="group relative overflow-hidden h-32 md:h-40 cursor-pointer transition-all duration-300 hover:shadow-lg">
                {/* Arka Plan Görseli */}
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                )}

                {/* Gradient Overlay */}
                <div className="gradient-overlay" />

                {/* İçerik */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                    <h3 className="font-semibold text-lg">{name}</h3>
                    {typeof productCount === "number" && (
                        <p className="text-sm text-white/80">{productCount} ürün</p>
                    )}
                </div>

                {/* Ok İkonu */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-6 w-6 text-white" />
                </div>
            </Card>
        </Link>
    )
}
