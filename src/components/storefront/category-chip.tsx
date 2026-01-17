"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryChipProps {
    name: string
    slug: string
    isActive?: boolean
    onClick?: () => void
}

/**
 * Premium Kategori Chip Bileşeni
 * Yatay scroll kategoriler için kullanılır
 * Glassmorphism & Gradient estetiği
 */
export const CategoryChip = ({
    name,
    slug,
    isActive = false,
    onClick,
}: CategoryChipProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap",
                "transition-all duration-500 ease-out",
                "font-semibold text-sm",
                "hover:scale-105 active:scale-95",
                "overflow-hidden",
                isActive
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-xl shadow-primary/30"
                    : "bg-white/80 backdrop-blur-md border border-primary/10 hover:border-primary/30 hover:bg-white shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10"
            )}
        >
            {/* Animated shimmer effect for active state */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
            )}

            <Sparkles className={cn(
                "h-4 w-4 transition-all duration-500",
                isActive
                    ? "text-white animate-pulse"
                    : "text-primary/60 group-hover:text-primary"
            )} style={isActive ? { animationDuration: '2s' } : {}} />

            <span className="relative z-10">{name}</span>

            {/* Glow effect for active */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-blue-600/50 blur-xl opacity-50 -z-10" />
            )}
        </button>
    )
}
