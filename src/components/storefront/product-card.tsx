"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

interface ProductCardProps {
    id: string
    name: string
    price: number
    salePrice?: number
    imageUrl?: string
    attributes?: Record<string, string>
    onClick?: () => void
}

/**
 * Ürün Kartı Bileşeni
 * Reference.md Bölüm 4.1 - Glassmorphism estetiği
 * 
 * Mobil-öncelikli tasarım
 */
export const ProductCard = ({
    id,
    name,
    price,
    salePrice,
    imageUrl,
    attributes,
    onClick,
}: ProductCardProps) => {
    const hasDiscount = salePrice && salePrice < price
    const displayPrice = salePrice ?? price
    const discountPercent = hasDiscount
        ? Math.round(((price - salePrice) / price) * 100)
        : 0

    return (
        <Card
            className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg glass-panel"
            onClick={onClick}
        >
            {/* Ürün Görseli */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
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

            <CardContent className="p-3">
                {/* Ürün Adı */}
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{name}</h3>

                {/* Fiyat */}
                <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-primary">
                        {displayPrice.toLocaleString("tr-TR")} ₺
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                            {price.toLocaleString("tr-TR")} ₺
                        </span>
                    )}
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
