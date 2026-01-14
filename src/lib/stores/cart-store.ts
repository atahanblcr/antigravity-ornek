"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/types"

/**
 * Sepet Öğesi
 */
export interface CartItem {
    product: Product
    quantity: number
    selectedAttributes?: Record<string, string>
}

/**
 * Sepet State
 */
interface CartState {
    items: CartItem[]
    tenantId: string | null

    // Actions
    setTenantId: (tenantId: string) => void
    addItem: (product: Product, quantity?: number, attributes?: Record<string, string>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void

    // Computed
    getTotalItems: () => number
    getTotalPrice: () => number
    getItemCount: (productId: string) => number
}

/**
 * Sepet Store
 * Reference.md Bölüm 6.2 - Durumsuz Sipariş Yönetimi
 * 
 * Local Storage ile persist edilir
 * Farklı tenant'lar için ayrı sepet tutulur
 */
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            tenantId: null,

            setTenantId: (tenantId) => {
                const currentTenantId = get().tenantId
                // Farklı tenant'a geçildiğinde sepeti temizle
                if (currentTenantId && currentTenantId !== tenantId) {
                    set({ items: [], tenantId })
                } else {
                    set({ tenantId })
                }
            },

            addItem: (product, quantity = 1, attributes) => {
                const items = get().items
                const existingIndex = items.findIndex(
                    (item) =>
                        item.product.id === product.id &&
                        JSON.stringify(item.selectedAttributes) === JSON.stringify(attributes)
                )

                if (existingIndex > -1) {
                    // Mevcut öğenin miktarını artır
                    const newItems = [...items]
                    newItems[existingIndex] = {
                        ...newItems[existingIndex],
                        quantity: newItems[existingIndex].quantity + quantity,
                    }
                    set({ items: newItems })
                } else {
                    // Yeni öğe ekle
                    set({
                        items: [
                            ...items,
                            { product, quantity, selectedAttributes: attributes },
                        ],
                    })
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.product.id !== productId),
                })
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId)
                    return
                }

                set({
                    items: get().items.map((item) =>
                        item.product.id === productId
                            ? { ...item, quantity }
                            : item
                    ),
                })
            },

            clearCart: () => {
                set({ items: [] })
            },

            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0)
            },

            getTotalPrice: () => {
                return get().items.reduce((sum, item) => {
                    const price = item.product.sale_price ?? item.product.base_price
                    return sum + price * item.quantity
                }, 0)
            },

            getItemCount: (productId) => {
                const item = get().items.find((i) => i.product.id === productId)
                return item?.quantity ?? 0
            },
        }),
        {
            name: "dijital-vitrin-cart",
            // Sadece gerekli alanları persist et
            partialize: (state) => ({
                items: state.items,
                tenantId: state.tenantId,
            }),
        }
    )
)

/**
 * Sepet öğelerini WhatsApp mesaj formatına dönüştür
 * Reference.md Bölüm 6.1
 */
export function cartItemsToOrderItems(items: CartItem[]) {
    return items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        attributes: item.selectedAttributes,
        price: item.product.sale_price ?? item.product.base_price,
    }))
}
