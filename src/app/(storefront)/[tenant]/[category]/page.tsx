import * as React from "react"
import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ResponsiveFilter } from "@/components/filters/responsive-filter"
import { ProductGrid } from "@/components/storefront/product-grid"
import { StorefrontHeader } from "@/components/storefront/storefront-header"
import { WhatsAppOrderButton } from "@/components/shared/whatsapp-order-button"
import type { Product } from "@/types"

export async function generateMetadata({ params }: { params: Promise<{ tenant: string; category: string }> }) {
    const resolvedParams = await params
    return {
        title: `${resolvedParams.category.toUpperCase()} | ${resolvedParams.tenant}`,
    }
}

/**
 * Kategori Detay Sayfası (Server Component)
 * Reference.md - Kategori bazlı filtreleme ve listeleme
 */
export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ tenant: string; category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                },
            },
        }
    )

    // 1. Tenant'ı bul
    const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", resolvedParams.tenant)
        .single()

    if (!tenant) {
        // notFound()
    }

    // 2. Kategoriyi bul
    const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .eq("slug", resolvedParams.category)
        .single()

    if (!categoryData) {
        // notFound() 
    }

    // 3. Ürünleri çek
    let query = supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .eq("category_id", categoryData?.id)
        .eq("is_active", true)
        .is("deleted_at", null)

    // Filtreleri uygula
    const filters: Record<string, string> = {}
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
        if (typeof value === "string") {
            filters[key] = value
        }
    })

    if (Object.keys(filters).length > 0) {
        query = query.contains("attributes", filters)
    }

    const { data: products } = await query

    return (
        <div className="min-h-screen bg-background pb-20">
            <StorefrontHeader
                name={tenant?.name || resolvedParams.tenant}
                slug={resolvedParams.tenant}
                whatsappNumber={tenant?.whatsapp_number}
            />

            <main className="container px-4 py-6">
                <div className="flex flex-col gap-6">
                    {/* Başlık ve Filtre */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold capitalize">{categoryData?.name || resolvedParams.category}</h1>
                            <p className="text-muted-foreground text-sm">
                                {products?.length || 0} ürün
                            </p>
                        </div>
                        <ResponsiveFilter>
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Filtreleme seçenekleri yakında eklenecek.
                            </div>
                        </ResponsiveFilter>
                    </div>

                    {/* Ürün Listesi */}
                    {products && products.length > 0 ? (
                        <ProductGrid products={products as Product[]} />
                    ) : (
                        <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-lg">
                            Bu kategoride ürün bulunamadı.
                        </div>
                    )}
                </div>
            </main>

            <WhatsAppOrderButton
                tenantId={tenant?.id || ""}
                storeName={tenant?.name || ""}
                phoneNumber={tenant?.whatsapp_number || ""}
            />
        </div>
    )
}
