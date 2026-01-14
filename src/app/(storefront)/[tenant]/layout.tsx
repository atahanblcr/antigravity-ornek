import * as React from "react"
import type { Metadata } from "next"

interface StorefrontLayoutProps {
    children: React.ReactNode
    params: Promise<{ tenant: string }>
}

export async function generateMetadata({
    params,
}: StorefrontLayoutProps): Promise<Metadata> {
    const { tenant } = await params

    // TODO: Supabase'den tenant bilgilerini çek
    const tenantName = tenant.charAt(0).toUpperCase() + tenant.slice(1)

    return {
        title: `${tenantName} | Dijital Vitrin`,
        description: `${tenantName} ürün kataloğu - Dijital Vitrin`,
        openGraph: {
            title: tenantName,
            description: `${tenantName} ürün kataloğu`,
            type: "website",
        },
    }
}

/**
 * Storefront Layout
 * Herkese açık vitrin sayfaları için layout
 * Reference.md - Mobil-öncelikli tasarım
 */
export default async function StorefrontLayout({
    children,
    params,
}: StorefrontLayoutProps) {
    const { tenant } = await params

    return (
        <div className="min-h-screen bg-background">
            {/* Header alanı - Tenant bilgileri child page'lerde render edilecek */}
            <div className="relative">
                {children}
            </div>

            {/* WhatsApp butonu için alan - sayfalarda render edilecek */}
        </div>
    )
}
