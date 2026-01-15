"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
    name: string
    description?: string
}

export function HeroSection({ name, description }: HeroSectionProps) {
    return (
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black text-white">
            {/* Abstract Background - Premium Dark */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="container relative z-10 px-4 text-center space-y-8 animate-fade-in">
                <div className="space-y-4">
                    <p className="text-xs md:text-sm uppercase tracking-[0.3em] opacity-70 animate-slide-up">
                        Koleksiyon 2026
                    </p>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white animate-slide-up animation-delay-200">
                        {name}
                    </h1>
                    {description && (
                        <p className="max-w-xl mx-auto text-lg md:text-xl text-neutral-400 font-light animate-slide-up animation-delay-400">
                            {description}
                        </p>
                    )}
                </div>

                <div className="animate-slide-up animation-delay-400">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]"
                    >
                        <Link href="#products">
                            Alışverişe Başla
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
