"use client"

import * as React from "react"
import Image from "next/image"
import { Layers, Briefcase, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
    name: string
    description?: string
    heroImageUrl?: string
    onCategoriesClick?: () => void
    onServicesClick?: () => void
}

/**
 * Premium Hero Section
 * Blurred business photo background with category/service buttons
 */
export function HeroSection({
    name,
    description,
    heroImageUrl,
    onCategoriesClick,
    onServicesClick
}: HeroSectionProps) {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Blur */}
            {heroImageUrl ? (
                <>
                    {/* Full image - blurred background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={heroImageUrl}
                            alt={name}
                            fill
                            className="object-cover scale-110 blur-sm"
                            sizes="100vw"
                            priority
                        />
                    </div>
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                </>
            ) : (
                /* Fallback: Animated Mesh Gradient */
                <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                    <div
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '8s' }}
                    />
                    <div
                        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/25 via-indigo-500/15 to-transparent rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '10s', animationDelay: '1s' }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
                </div>
            )}

            {/* Content */}
            <div className="container relative z-10 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Store Name */}
                    <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] ${heroImageUrl
                            ? 'text-white drop-shadow-2xl'
                            : 'bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent'
                        }`}>
                        {name}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className={`max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed ${heroImageUrl
                                ? 'text-white/90 drop-shadow-lg'
                                : 'text-muted-foreground/80'
                            }`}>
                            {description}
                        </p>
                    )}

                    {/* Action Buttons - Categories & Services */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        {/* Kategoriler Button */}
                        <Button
                            size="lg"
                            onClick={() => onCategoriesClick ? onCategoriesClick() : scrollToSection('products')}
                            className={`group relative rounded-2xl px-8 py-6 text-lg font-semibold transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 ${heroImageUrl
                                    ? 'bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30'
                                    : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-700 shadow-primary/25 hover:shadow-primary/40'
                                }`}
                        >
                            <Layers className="h-5 w-5 mr-3" />
                            <span>Kategoriler</span>
                            <ArrowRight className="h-5 w-5 ml-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Button>

                        {/* Hizmetler Button */}
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => onServicesClick ? onServicesClick() : scrollToSection('services')}
                            className={`group relative rounded-2xl px-8 py-6 text-lg font-semibold transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 ${heroImageUrl
                                    ? 'bg-white/10 backdrop-blur-xl text-white border-2 border-white/40 hover:bg-white/20 hover:border-white/60'
                                    : 'bg-white border-2 border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/40'
                                }`}
                        >
                            <Briefcase className="h-5 w-5 mr-3" />
                            <span>Hizmetlerimiz</span>
                            <ArrowRight className="h-5 w-5 ml-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
        </section>
    )
}
