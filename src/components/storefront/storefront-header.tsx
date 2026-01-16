"use client"

import * as React from "react"
import Image from "next/image"
import { Store, MapPin, Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StorefrontHeaderProps {
    name: string
    slug: string
    tenantId: string
    logoUrl?: string
    description?: string
    whatsappNumber: string
    location?: string
}

/**
 * Storefront Header Bileşeni
 * Mağaza bilgileri, logo ve sepet
 * Glassmorphism estetiği
 */
export const StorefrontHeader = ({
    name,
    slug,
    tenantId,
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
        <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-white/10 bg-white/80 backdrop-blur-md support-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">

                    {/* Sol: Logo ve İsim */}
                    <div className="flex items-center gap-3">
                        {logoUrl ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-black/5">
                                <Image
                                    src={logoUrl}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Store className="h-5 w-5" />
                            </div>
                        )}

                        <div className="hidden md:block">
                            <h1 className="text-lg font-bold tracking-tight leading-none">{name}</h1>
                            {location && (
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {location}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sağ: Aksiyonlar */}
                    <div className="flex items-center gap-2">
                        {/* WhatsApp (Mobile Only icon, Desktop text) */}
                        {whatsappNumber && (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <a href={`tel:${whatsappNumber}`}>
                                    <Phone className="h-4 w-4" />
                                    <span>{whatsappNumber}</span>
                                </a>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleShare}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
