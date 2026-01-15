import * as React from "react"
import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/storefront/product-grid"
import { WhatsAppOrderButton } from "@/components/shared/whatsapp-order-button"
import { CategoryFiltersClient } from "./category-filters-client"
import type { Product } from "@/types"

interface PageProps {
    params: Promise<{ tenant: string; category: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps) {
    const { tenant, category } = await params
    return {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} | ${tenant}`,
    }
}

/**
 * Kategori Detay Sayfası (Server Component)
 * Basit filtreleme: Fiyat aralığı ve sıralama
 */
export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { tenant: tenantSlug, category: categorySlug } = await params
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
                setAll() { },
            },
        }
    )

    // 1. Tenant'ı bul
    const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", tenantSlug)
        .single()

    if (tenantError || !tenant) {
        notFound()
    }

    // 2. Kategoriyi bul
    const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("slug", categorySlug)
        .single()

    if (categoryError || !categoryData) {
        notFound()
    }

    // 3. URL'den filtreleri al
    const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice as string) : undefined
    const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice as string) : undefined
    const sortBy = resolvedSearchParams.sort as string | undefined

    // 4. Ürünleri çek
    let query = supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("category_id", categoryData.id)
        .eq("is_active", true)
        .is("deleted_at", null)

    // Fiyat aralığı filtresi
    if (minPrice !== undefined) {
        query = query.gte("base_price", minPrice)
    }
    if (maxPrice !== undefined) {
        query = query.lte("base_price", maxPrice)
    }

    // Sıralama
    if (sortBy === "price_asc") {
        query = query.order("base_price", { ascending: true })
    } else if (sortBy === "price_desc") {
        query = query.order("base_price", { ascending: false })
    } else if (sortBy === "name_asc") {
        query = query.order("name", { ascending: true })
    } else if (sortBy === "name_desc") {
        query = query.order("name", { ascending: false })
    } else {
        // Varsayılan: En yeni ürünler
        query = query.order("created_at", { ascending: false })
    }

    const { data: products } = await query

    // 5. Fiyat aralığı bilgisi için min/max fiyatları al
    const { data: priceStats } = await supabase
        .from("products")
        .select("base_price")
        .eq("tenant_id", tenant.id)
        .eq("category_id", categoryData.id)
        .eq("is_active", true)
        .is("deleted_at", null)

    let minAvailablePrice = 0
    let maxAvailablePrice = 10000
    if (priceStats && priceStats.length > 0) {
        const prices = priceStats.map(p => p.base_price)
        minAvailablePrice = Math.floor(Math.min(...prices))
        maxAvailablePrice = Math.ceil(Math.max(...prices))
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="container px-4 h-14 flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${tenantSlug}`} className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">{tenant.name}</span>
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-semibold truncate">{categoryData.name}</h1>
                    </div>
                </div>
            </header>

            <main className="container px-4 py-6">
                <div className="flex flex-col gap-6">
                    {/* Kategori Başlığı ve Filtreler */}
                    <CategoryFiltersClient
                        categoryName={categoryData.name}
                        productCount={products?.length || 0}
                        minPrice={minAvailablePrice}
                        maxPrice={maxAvailablePrice}
                        currentMinPrice={minPrice}
                        currentMaxPrice={maxPrice}
                        currentSort={sortBy}
                    />

                    {/* Ürün Listesi */}
                    {products && products.length > 0 ? (
                        <ProductGrid products={products as Product[]} tenantSlug={tenantSlug} />
                    ) : (
                        <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-lg">
                            {minPrice || maxPrice || sortBy
                                ? "Bu filtrelerle eşleşen ürün bulunamadı."
                                : "Bu kategoride ürün bulunamadı."}
                        </div>
                    )}
                </div>
            </main>

            <WhatsAppOrderButton
                tenantId={tenant.id}
                storeName={tenant.name}
                phoneNumber={tenant.whatsapp_number}
            />
        </div>
    )
}
