import * as React from "react"
import { Package, FolderOpen, ShoppingCart, FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: {
        label: string
        href: string
    }
}

/**
 * Genel Empty State Bileşeni
 */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                {icon || <FileQuestion className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action && (
                <Button asChild>
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </div>
    )
}

/**
 * Ürün Yok State
 */
export function NoProductsState() {
    return (
        <EmptyState
            title="Henüz ürün yok"
            description="İlk ürününüzü ekleyerek başlayın. Müşterileriniz vitrinde ürünlerinizi görebilecek."
            icon={<Package className="w-8 h-8 text-muted-foreground" />}
            action={{
                label: "Ürün Ekle",
                href: "/dashboard/products/new"
            }}
        />
    )
}

/**
 * Kategori Yok State
 */
export function NoCategoriesState() {
    return (
        <EmptyState
            title="Henüz kategori yok"
            description="Ürünlerinizi düzenlemek için kategoriler oluşturun."
            icon={<FolderOpen className="w-8 h-8 text-muted-foreground" />}
            action={{
                label: "Kategori Oluştur",
                href: "/dashboard/categories/new"
            }}
        />
    )
}

/**
 * Sipariş Yok State
 */
export function NoOrdersState() {
    return (
        <EmptyState
            title="Henüz sipariş yok"
            description="Müşterileriniz WhatsApp üzerinden sipariş verdiğinde burada görünecek."
            icon={<ShoppingCart className="w-8 h-8 text-muted-foreground" />}
        />
    )
}

/**
 * Arama Sonucu Yok State
 */
export function NoSearchResultsState({ query }: { query: string }) {
    return (
        <EmptyState
            title="Sonuç bulunamadı"
            description={`"${query}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.`}
        />
    )
}
