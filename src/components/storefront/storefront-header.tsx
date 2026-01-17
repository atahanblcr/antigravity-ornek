"use client"

import * as React from "react"
import Image from "next/image"
import { Store, MapPin, Phone, Share2 } from "lucide-react"
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
 * Mağaza bilgileri ve logo
 * Premium Glassmorphism estetiği
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
    const handleShare = async () => {
        const shareData = {
            title: name,
            text: `${name} vitrinini incele!`,
            url: window.location.href,
        }

        // Web Share API destekleniyorsa native paylaşım kullan
        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                // Kullanıcı paylaşımı iptal ettiyse sessizce çık
            }
        } else {
            // Fallback: WhatsApp ile paylaş
            const shareUrl = `https://wa.me/?text=${encodeURIComponent(
                `${name} vitrinini incele: ${window.location.href}`
            )}`
            window.open(shareUrl, "_blank")
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-500 border-b border-primary/10 bg-gradient-to-b from-primary/5 via-white/95 to-transparent backdrop-blur-xl supports-[backdrop-filter]:bg-white/40">
            {/* Subtle animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-blue-600/3 opacity-60 pointer-events-none" />

            <div className="container relative mx-auto px-4 py-3.5">
                <div className="flex items-center justify-between gap-4">

                    {/* Sol: Logo ve İsim */}
                    <div className="flex items-center gap-3.5">
                        {logoUrl ? (
                            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-lg shadow-primary/10 ring-2 ring-white/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                                <Image
                                    src={logoUrl}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                    sizes="44px"
                                />
                            </div>
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-white/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40">
                                <Store className="h-5 w-5" />
                            </div>
                        )}

                        <div className="hidden md:block">
                            <h1 className="text-lg font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{name}</h1>
                            {location && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-primary/70" /> {location}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sağ: Aksiyonlar */}
                    <div className="flex items-center gap-2">
                        {/* WhatsApp İletişim Butonu */}
                        {whatsappNumber && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="group hidden md:flex gap-2.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl px-4"
                                >
                                    <a
                                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div className="relative">
                                            <Share2 className="h-4 w-4 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <span className="font-medium">WhatsApp</span>
                                    </a>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="group hidden md:flex gap-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl px-4"
                                >
                                    <a href={`tel:${whatsappNumber}`}>
                                        <div className="relative">
                                            <Phone className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <span className="font-medium">{whatsappNumber}</span>
                                    </a>
                                </Button>
                            </>
                        )}

                        {/* Mobile: Telefon İkonu */}
                        {whatsappNumber && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="md:hidden relative group hover:bg-green-50 transition-all duration-300 rounded-xl"
                                >
                                    <a
                                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Share2 className="h-5 w-5 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-green-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </a>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="md:hidden relative group hover:bg-primary/10 transition-all duration-300 rounded-xl"
                                >
                                    <a href={`tel:${whatsappNumber}`}>
                                        <Phone className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </a>
                                </Button>
                            </>
                        )}

                        {/* Paylaş Butonu */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleShare}
                            className="relative group hover:bg-blue-600/10 transition-all duration-300 rounded-xl"
                        >
                            <Share2 className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-blue-600/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
