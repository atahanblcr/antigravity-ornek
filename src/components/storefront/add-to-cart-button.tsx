"use client"

import * as React from "react"
import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Plus, Minus, ShoppingCart, Check } from "lucide-react"
import type { Product } from "@/types"

interface AddToCartButtonProps {
    product: Product
    selectedAttributes?: Record<string, string>
    variant?: "default" | "compact"
    className?: string
}

/**
 * Sepete Ekle Butonu
 * Animasyonlu feedback ile
 */
export function AddToCartButton({
    product,
    selectedAttributes,
    variant = "default",
    className = "",
}: AddToCartButtonProps) {
    const { addItem, getItemCount, updateQuantity, removeItem } = useCartStore()
    const [isAdded, setIsAdded] = React.useState(false)

    const itemCount = getItemCount(product.id)

    const handleAdd = () => {
        addItem(product, 1, selectedAttributes)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1500)
    }

    const handleIncrement = () => {
        updateQuantity(product.id, itemCount + 1)
    }

    const handleDecrement = () => {
        if (itemCount > 1) {
            updateQuantity(product.id, itemCount - 1)
        } else {
            removeItem(product.id)
        }
    }

    // Sepette ürün varsa miktar kontrolü göster
    if (itemCount > 0) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleDecrement}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{itemCount}</span>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleIncrement}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    // Compact variant (ürün kartları için)
    if (variant === "compact") {
        return (
            <Button
                variant="secondary"
                size="icon"
                className={`h-9 w-9 ${className}`}
                onClick={handleAdd}
            >
                {isAdded ? (
                    <Check className="h-4 w-4 text-green-600" />
                ) : (
                    <Plus className="h-4 w-4" />
                )}
            </Button>
        )
    }

    // Default variant
    return (
        <Button
            onClick={handleAdd}
            className={`gap-2 ${className}`}
            disabled={isAdded}
        >
            {isAdded ? (
                <>
                    <Check className="h-4 w-4" />
                    Eklendi
                </>
            ) : (
                <>
                    <ShoppingCart className="h-4 w-4" />
                    Sepete Ekle
                </>
            )}
        </Button>
    )
}
