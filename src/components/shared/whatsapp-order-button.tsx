"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatWhatsAppNumber, createWhatsAppUrl } from "@/lib/utils/whatsapp"
import { MessageCircle } from "lucide-react"

interface WhatsAppOrderButtonProps {
    tenantId: string
    storeName: string
    phoneNumber: string
    className?: string
    // Ürün detay sayfasında kullanılacak opsiyonel alanlar
    productName?: string
    productPrice?: number
    selectedAttributes?: Record<string, string>
}

/**
 * WhatsApp İletişim Butonu
 * Reference.md Bölüm 6 - WhatsApp Ticareti entegrasyonu
 * 
 * Sticky footer olarak kullanılır
 * iOS safe area padding uygulanır
 * 
 * Ürün detay sayfasında productName, productPrice ve selectedAttributes
 * parametreleri ile kullanılırsa, seçili varyantlarla birlikte sipariş mesajı oluşturur
 */
export const WhatsAppOrderButton = ({
    tenantId,
    storeName,
    phoneNumber,
    className = "",
    productName,
    productPrice,
    selectedAttributes,
}: WhatsAppOrderButtonProps) => {
    const formattedPhone = formatWhatsAppNumber(phoneNumber)

    // Ürün bilgisi varsa sipariş mesajı, yoksa genel mesaj oluştur
    const whatsappUrl = React.useMemo(() => {
        if (productName && productPrice) {
            // Ürün detay sayfası - sipariş mesajı oluştur
            return createWhatsAppUrl({
                storeName,
                phoneNumber,
                items: [{
                    name: productName,
                    quantity: 1,
                    price: productPrice,
                    attributes: selectedAttributes && Object.keys(selectedAttributes).length > 0
                        ? selectedAttributes
                        : undefined
                }]
            })
        } else {
            // Genel sayfa - tanıtım mesajı
            const message = encodeURIComponent(`Merhaba, ${storeName} vitrininden ürünlerinizi inceliyorum.`)
            return `https://wa.me/${formattedPhone}?text=${message}`
        }
    }, [storeName, phoneNumber, formattedPhone, productName, productPrice, selectedAttributes])

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()

        // 1. WhatsApp linkini hemen aç (Popup blocker'a takılmamak için)
        window.open(whatsappUrl, '_blank')

        // 2. Analitik olayını arka planda gönder (Fire-and-forget)
        fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenant_id: tenantId,
                event_type: "order_initiated",
                payload: {
                    store: storeName,
                    source: window.location.pathname,
                    product: productName || null,
                    attributes: selectedAttributes || null
                }
            })
        }).catch(error => {
            console.error("Analytics error:", error)
        })
    }

    // Buton metni - ürün varsa "Sipariş Ver", yoksa "İletişime Geç"
    const buttonText = productName
        ? "WhatsApp ile Sipariş Ver"
        : "WhatsApp ile İletişime Geç"

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
                <span>{buttonText}</span>
            </Button>
        </div>
    )
}
