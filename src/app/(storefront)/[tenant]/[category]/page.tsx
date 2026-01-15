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
 * Reference.md Bölüm 3.3 - JSONB @> Filtreleme
 * Reference.md Bölüm 3.4 - Fasetli Arama
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
    const filters: Record<string, string> = {}
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
        if (typeof value === "string" && key !== "sort") {
            filters[key] = value
        }
    })

    // 4. Ürünleri çek (JSONB @> filtreleme)
    let query = supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("category_id", categoryData.id)
        .eq("is_active", true)
        .is("deleted_at", null)

    // Reference.md Bölüm 3.3 - JSONB @> operatörü ile filtreleme
    if (Object.keys(filters).length > 0) {
        // DB'de attribute değerleri array olarak saklanıyor (ör. "Renk": ["Siyah"])
        // URL'den gelen değerler string (ör. "Renk": "Siyah")
        // @> operatörü için değeri array içine almalıyız: {"Renk": ["Siyah"]}
        const arrayFilters: Record<string, string[]> = {}
        Object.entries(filters).forEach(([key, value]) => {
            arrayFilters[key] = [value]
        })
        query = query.contains("attributes", arrayFilters)
    }

    // Sıralama
    const sortBy = resolvedSearchParams.sort as string | undefined
    if (sortBy === "price_asc") {
        query = query.order("base_price", { ascending: true })
    } else if (sortBy === "price_desc") {
        query = query.order("base_price", { ascending: false })
    } else {
        query = query.order("created_at", { ascending: false })
    }

    const { data: products } = await query

    // 5. Fasetli arama için RPC fonksiyonu çağır
    // Bu kategorideki tüm attribute değerlerini al
    const facets: Record<string, { value: string; count: number }[]> = {}

    // Tüm ürünlerin attribute'larından benzersiz key'leri bul
    const allProducts = await supabase
        .from("products")
        .select("attributes")
        .eq("tenant_id", tenant.id)
        .eq("category_id", categoryData.id)
        .eq("is_active", true)
        .is("deleted_at", null)

    if (allProducts.data) {
        const attributeKeys = new Set<string>()
        allProducts.data.forEach((p) => {
            const attrs = p.attributes as Record<string, string | string[]> | null
            if (attrs) {
                Object.keys(attrs).forEach((key) => attributeKeys.add(key))
            }
        })

        // Her attribute key için değerleri say
        attributeKeys.forEach((key) => {
            const valueCount = new Map<string, number>()
            allProducts.data.forEach((p) => {
                const attrs = p.attributes as Record<string, string | string[]> | null
                if (attrs && attrs[key]) {
                    const val = attrs[key]
                    if (typeof val === "string") {
                        valueCount.set(val, (valueCount.get(val) || 0) + 1)
                    } else if (Array.isArray(val)) {
                        val.forEach((v) => {
                            valueCount.set(v, (valueCount.get(v) || 0) + 1)
                        })
                    }
                }
            })

            if (valueCount.size > 0) {
                facets[key] = Array.from(valueCount.entries())
                    .map(([value, count]) => ({ value, count }))
                    .sort((a, b) => b.count - a.count)
            }
        })
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
                        facets={facets}
                        activeFilters={filters}
                    />

                    {/* Ürün Listesi */}
                    {products && products.length > 0 ? (
                        <ProductGrid products={products as Product[]} tenantSlug={tenantSlug} />
                    ) : (
                        <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-lg">
                            {Object.keys(filters).length > 0
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
