"use client"

import * as React from "react"
import { Tag } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryChipProps {
    name: string
    slug: string
    isActive?: boolean
    onClick?: () => void
}

/**
 * Kompakt Kategori Chip Bileşeni
 * Yatay scroll kategoriler için kullanılır
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
                "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap",
                "transition-all duration-300 ease-out",
                "border-2 font-medium text-sm",
                "hover:scale-105 active:scale-95",
                isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-background border-border hover:border-primary/50 hover:bg-secondary/50"
            )}
        >
            <Tag className={cn(
                "h-4 w-4 transition-transform duration-300",
                isActive && "rotate-12"
            )} />
            <span>{name}</span>
        </button>
    )
}
