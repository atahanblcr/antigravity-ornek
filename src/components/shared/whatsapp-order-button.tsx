"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatWhatsAppNumber } from "@/lib/utils/whatsapp"
import { MessageCircle } from "lucide-react"

interface WhatsAppOrderButtonProps {
    tenantId: string
    storeName: string
    phoneNumber: string
    className?: string
}

/**
 * WhatsApp İletişim Butonu
 * Reference.md Bölüm 6 - WhatsApp Ticareti entegrasyonu
 * 
 * Sticky footer olarak kullanılır
 * iOS safe area padding uygulanır
 */
export const WhatsAppOrderButton = ({
    tenantId,
    storeName,
    phoneNumber,
    className = "",
}: WhatsAppOrderButtonProps) => {
    const formattedPhone = formatWhatsAppNumber(phoneNumber)
    const message = encodeURIComponent(`Merhaba, ${storeName} vitrininden ürünlerinizi inceliyorum.`)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: tenantId,
                    event_type: "order_initiated",
                    payload: {
                        store: storeName,
                        source: window.location.pathname
                    }
                })
            })
        } catch (error) {
            console.error("Analytics error:", error)
        }

        window.open(whatsappUrl, '_blank')
    }

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background/80 backdrop-blur-sm border-t ${className}`}
        >
            <Button
                onClick={handleClick}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-12 text-base font-medium"
            >
                <Link href={whatsappUrl} target="_blank" className="hidden" onClick={(e) => e.preventDefault()} />
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp ile İletişime Geç</span>
            </Button>
        </div>
    )
}
