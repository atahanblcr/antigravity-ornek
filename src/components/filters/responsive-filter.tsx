"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-media-query"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"

interface ResponsiveFilterProps {
    children: React.ReactNode
    title?: string
    triggerLabel?: string
}

/**
 * Responsive Filter Bileşeni
 * Reference.md Bölüm 4.2.1 - Drawer (Mobil) / Sheet (Masaüstü) deseni
 * 
 * Mobil: Alttan yukarı açılan Drawer
 * Masaüstü: Sağdan açılan Sheet
 */
export const ResponsiveFilter = ({
    children,
    title = "Filtreler",
    triggerLabel = "Filtrele",
}: ResponsiveFilterProps) => {
    const isMobile = useIsMobile()
    const [open, setOpen] = React.useState(false)

    // Mobil: Drawer (alttan yukarı)
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        {triggerLabel}
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-8 overflow-y-auto">
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    // Masaüstü: Sheet (sağdan)
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {triggerLabel}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[320px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 overflow-y-auto">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    )
}
