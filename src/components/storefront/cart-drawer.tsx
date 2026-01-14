"use client"

import * as React from "react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-media-query"
import { useCartStore, cartItemsToOrderItems } from "@/lib/stores/cart-store"
import { createWhatsAppUrl } from "@/lib/utils/whatsapp"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
} from "@/components/ui/drawer"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle } from "lucide-react"

interface CartDrawerProps {
    storeName: string
    phoneNumber: string
    tenantId: string
}

/**
 * Sepet Drawer Bileşeni
 * Reference.md Bölüm 4.2.1 - Mobil Drawer / Masaüstü Sheet
 * Reference.md Bölüm 6 - WhatsApp Ticareti
 */
export function CartDrawer({ storeName, phoneNumber, tenantId }: CartDrawerProps) {
    const isMobile = useIsMobile()
    const [open, setOpen] = React.useState(false)

    const { items, getTotalItems, getTotalPrice, updateQuantity, removeItem, clearCart, setTenantId } =
        useCartStore()

    // Tenant ID'yi set et
    React.useEffect(() => {
        setTenantId(tenantId)
    }, [tenantId, setTenantId])

    const totalItems = getTotalItems()
    const totalPrice = getTotalPrice()

    const handleWhatsAppOrder = () => {
        if (items.length === 0) return

        const orderItems = cartItemsToOrderItems(items)
        const whatsappUrl = createWhatsAppUrl({
            storeName,
            phoneNumber,
            items: orderItems,
            totalAmount: totalPrice,
            orderReference: `SIP-${Date.now().toString(36).toUpperCase()}`,
        })

        // Analytics event gönder
        fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tenant_id: tenantId,
                event_type: "initiated",
                cart_data: { items: orderItems, total: totalPrice },
            }),
        }).catch(console.error)

        window.open(whatsappUrl, "_blank")
        clearCart()
        setOpen(false)
    }

    const CartContent = () => (
        <div className="flex flex-col h-full">
            {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Sepetiniz boş</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={`${item.product.id}-${JSON.stringify(item.selectedAttributes)}`}
                            className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                            {/* Ürün Görseli */}
                            <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                                {item.product.image_url ? (
                                    <img
                                        src={item.product.image_url}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                        Görsel Yok
                                    </div>
                                )}
                            </div>

                            {/* Ürün Bilgileri */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                    {item.product.name}
                                </h4>

                                {/* Seçili Özellikler */}
                                {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {Object.entries(item.selectedAttributes)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(", ")}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                    {/* Fiyat */}
                                    <span className="font-semibold text-sm">
                                        {((item.product.sale_price ?? item.product.base_price) * item.quantity).toLocaleString("tr-TR")} ₺
                                    </span>

                                    {/* Miktar Kontrolü */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-6 text-center text-sm font-medium">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={() => removeItem(item.product.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    const CartFooter = () => (
        <div className="border-t pt-4 space-y-4">
            {/* Toplam */}
            <div className="flex items-center justify-between px-4">
                <span className="font-medium">Toplam</span>
                <span className="text-xl font-bold">
                    {totalPrice.toLocaleString("tr-TR")} ₺
                </span>
            </div>

            {/* WhatsApp Sipariş Butonu */}
            <div className="px-4 pb-4 pb-safe">
                <Button
                    onClick={handleWhatsAppOrder}
                    disabled={items.length === 0}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-12"
                >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp ile Sipariş Ver
                </Button>
            </div>
        </div>
    )

    const TriggerButton = (
        <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {totalItems}
                </span>
            )}
        </Button>
    )

    // Mobil: Drawer (alttan yukarı)
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Sepetim ({totalItems})
                        </DrawerTitle>
                    </DrawerHeader>
                    <CartContent />
                    <DrawerFooter className="p-0">
                        <CartFooter />
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    // Masaüstü: Sheet (sağdan)
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
            <SheetContent className="w-[400px] flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Sepetim ({totalItems})
                    </SheetTitle>
                </SheetHeader>
                <CartContent />
                <SheetFooter className="mt-auto p-0">
                    <CartFooter />
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
