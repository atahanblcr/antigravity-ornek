import * as React from "react"
import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { ChevronLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareButton } from "@/components/storefront/share-button"
import { ProductDetailClient } from "./product-detail-client"
import { StorefrontHeader } from "@/components/storefront/storefront-header"
import { StorefrontFooter } from "@/components/storefront/storefront-footer"
import type { Metadata } from "next"

interface PageProps {
    params: Promise<{ tenant: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { tenant, slug } = await params

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() { },
            },
        }
    )

    // Tenant'ı bul
    const { data: tenantData } = await supabase
        .from("tenants")
        .select("id, name")
        .eq("slug", tenant)
        .single()

    if (!tenantData) {
        return { title: "Ürün Bulunamadı" }
    }

    // Ürünü bul
    const { data: product } = await supabase
        .from("products")
        .select("name, description")
        .eq("tenant_id", tenantData.id)
        .eq("slug", slug)
        .single()

    if (!product) {
        return { title: "Ürün Bulunamadı" }
    }

    return {
        title: `${product.name} | ${tenantData.name}`,
        description: product.description || `${product.name} - ${tenantData.name} vitrininde`,
    }
}

/**
 * Ürün Detay Sayfası (Server Component)
 * Reference.md Bölüm 3 - JSONB Ürün Nitelikleri
 */
export default async function ProductDetailPage({ params }: PageProps) {
    const { tenant, slug } = await params
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() { },
            },
        }
    )

    // Tenant'ı bul
    const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", tenant)
        .single()

    if (tenantError || !tenantData) {
        notFound()
    }

    // Ürünü bul
    const { data: product, error: productError } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("tenant_id", tenantData.id)
        .eq("slug", slug)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single()

    if (productError || !product) {
        notFound()
    }

    // İlgili ürünleri çek (aynı kategoriden)
    const { data: relatedProducts } = await supabase
        .from("products")
        .select("id, name, slug, base_price, sale_price, image_url, images, attributes")
        .eq("tenant_id", tenantData.id)
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(4)

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <StorefrontHeader
                name={tenantData.name}
                slug={tenant}
                tenantId={tenantData.id}
                whatsappNumber={tenantData.whatsapp_number}
                description={tenantData.description}
                logoUrl={tenantData.logo_url}
            />

            {/* Client Component - İnteraktif kısımlar */}
            <ProductDetailClient
                product={product}
                tenant={tenantData}
                relatedProducts={relatedProducts || []}
            />

            {/* Footer */}
            <StorefrontFooter
                tenantName={tenantData.name}
                whatsappNumber={tenantData.whatsapp_number}
                description={tenantData.description}
            />
        </div>
    )
}


