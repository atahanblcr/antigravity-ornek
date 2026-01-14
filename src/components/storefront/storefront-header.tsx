"use client"

import * as React from "react"
import Image from "next/image"
import { Store, MapPin, Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StorefrontHeaderProps {
    name: string
    slug: string
    logoUrl?: string
    description?: string
    whatsappNumber: string
    location?: string
}

/**
 * Storefront Header Bileşeni
 * Mağaza bilgileri ve logo
 * Glassmorphism estetiği
 */
export const StorefrontHeader = ({
    name,
    slug,
    logoUrl,
    description,
    whatsappNumber,
    location,
}: StorefrontHeaderProps) => {
    // Paylaş fonksiyonu - hydration mismatch önlemek için onClick kullanılır
    const handleShare = () => {
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(
            `${name} vitrinini incele: ${window.location.href}`
        )}`
        window.open(shareUrl, "_blank")
    }

    return (
        <header className="relative">
            {/* Arka Plan Gradyan */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

            {/* İçerik */}
            <div className="relative px-4 py-6 md:py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-background shadow-lg flex-shrink-0">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-primary/10">
                                    <Store className="h-8 w-8 text-primary" />
                                </div>
                            )}
                        </div>

                        {/* Bilgiler */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold truncate">{name}</h1>

                            {description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {description}
                                </p>
                            )}

                            {/* Meta Bilgiler */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                {location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    {whatsappNumber}
                                </span>
                            </div>
                        </div>

                        {/* Paylaş Butonu - onClick ile hydration mismatch önlenir */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={handleShare}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
