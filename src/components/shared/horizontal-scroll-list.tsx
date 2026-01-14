"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HorizontalScrollListProps {
    title?: string
    children: React.ReactNode
    showArrows?: boolean
}

/**
 * Yatay Kaydırma Listesi
 * Reference.md Bölüm 4.3 - Native CSS snap kullanımı
 * 
 * Mobilde doğal ivmeli kaydırma
 * Masaüstünde ok butonları
 */
export const HorizontalScrollList = ({
    title,
    children,
    showArrows = true,
}: HorizontalScrollListProps) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = React.useState(false)
    const [canScrollRight, setCanScrollRight] = React.useState(false)

    const checkScroll = React.useCallback(() => {
        if (!scrollRef.current) return

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }, [])

    React.useEffect(() => {
        checkScroll()
        const ref = scrollRef.current
        if (ref) {
            ref.addEventListener("scroll", checkScroll)
            window.addEventListener("resize", checkScroll)
        }
        return () => {
            if (ref) {
                ref.removeEventListener("scroll", checkScroll)
                window.removeEventListener("resize", checkScroll)
            }
        }
    }, [checkScroll])

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = 300
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        })
    }

    return (
        <div className="relative">
            {/* Başlık ve Oklar */}
            {(title || showArrows) && (
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
                    )}

                    {showArrows && (
                        <div className="hidden md:flex gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => scroll("left")}
                                disabled={!canScrollLeft}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => scroll("right")}
                                disabled={!canScrollRight}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Kaydırılabilir Alan */}
            <div
                ref={scrollRef}
                className="scroll-snap-x flex gap-3 md:gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0"
            >
                {React.Children.map(children, (child) => (
                    <div className="scroll-snap-item flex-shrink-0">{child}</div>
                ))}
            </div>
        </div>
    )
}
