"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShareButton({ title, storeName }: { title: string; storeName: string }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({
                        title: `${title} | ${storeName}`,
                        url: window.location.href,
                    }).catch(() => { })
                } else {
                    // Fallback for desktop: Copy to clipboard
                    navigator.clipboard.writeText(window.location.href)
                    alert("Bağlantı kopyalandı!")
                }
            }}
        >
            <Share2 className="h-4 w-4" />
        </Button>
    )
}
