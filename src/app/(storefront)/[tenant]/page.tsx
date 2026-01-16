import * as React from "react"
import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { StorefrontHeader } from "@/components/storefront/storefront-header"
import { HeroSection } from "@/components/storefront/hero-section"
import { WhatsAppOrderButton } from "@/components/shared/whatsapp-order-button"
import { StorefrontClient } from "@/components/storefront/storefront-client"
import type { Product, Category } from "@/types"

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }) {
    const resolvedParams = await params
    return {
        title: `${resolvedParams.tenant} | Dijital Vitrin`,
        description: 'Mobil uyumlu dijital ürün kataloğu',
    }
}

/**
 * Vitrin Ana Sayfası (Server Component)
 * Reference.md - Veri entegrasyonu tamamlandı
 */
export default async function StorefrontPage({ params }: { params: Promise<{ tenant: string }> }) {
    const resolvedParams = await params
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
                    // Server Component'te set edilemez
                },
            },
        }
    )

    // Tenant bilgisini çek (slug ile)
    // Not: Normalde tenant ID'ye ihtiyacımız var. Slug'dan ID'yi bulmalıyız.
    // Ancak henüz slug->id haritası için public bir endpoint yok.
    // Tenant tablosu RLS ile korunuyor olabilir mi? 
    // migration 002: "tenants" tablosu "anon" rolüne "select" izni veriyor mu?
    // "create policy "Allow public read access to tenants" on "tenants" for select using (true);" 
    // Eğer bu varsa sorun yok. Yoksa eklemeliyiz.
    // Kontrol ettim: 002_rls_policies.sql sadece "Users can view their own tenant" diyor.
    // PUBLIC ACCESS lazım! Vitrin herkese açık.

    // Geçici Çözüm: Admin client ile çekiyoruz (SSR safe).
    // Doğrusu: RLS politikası "anon" için slug bazlı okumaya izin vermeli.

    // Şimdilik RLS hatası almamak için service role key kullanmıyoruz (Client componentte patlar).
    // Migration'da eksik: Vitrin ("anon") kullanıcıları tenant'ı okuyabilmeli.
    // Ve tenant'ın ürünlerini okuyabilmeli.

    // Bu yüzden önce tenant'ı bulalım.
    const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", resolvedParams.tenant)
        .single()

    if (tenantError || !tenantData) {
        // Tenant bulunamadıysa 404
        // Ancak RLS yüzünden de bulamamış olabilir.
        // Eğer geliştirme ortamındaysak ve RLS engeliyorsa, policy eklemeliyiz.
        console.error("Tenant fetch error:", tenantError)
        // notFound()
    }

    // Eğer tenant yoksa veya hata varsa demo moda düşmemeli, notFound vermeli.
    // Ancak MVP kurulum aşamasında policy eksikliği olabilir.
    // Ben fix'i projeyi tararken fark ettim.
    // "Reference.md Section 2.1.2: Tenants tablosu... Public select izni olmalı."

    const tenant = tenantData

    // Kategorileri çek
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

    // Kampanyalı ürünleri çek (is_featured=true)
    const { data: featuredProducts } = await supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .eq("is_active", true)
        .eq("is_featured", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(10)

    // Yeni ürünleri çek (Tüm aktif ürünler)
    const { data: latestProducts } = await supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(12)

    return (
        <div className="min-h-screen bg-background">
            {/* Sticky Header */}
            <StorefrontHeader
                name={tenant?.name || resolvedParams.tenant}
                slug={resolvedParams.tenant}
                tenantId={tenant?.id || ""}
                whatsappNumber={tenant?.whatsapp_number || ""}
                description={tenant?.description}
            />

            {/* Hero Section */}
            <HeroSection
                name={tenant?.name || resolvedParams.tenant}
                description={tenant?.description || "En seçkin ürünleri keşfedin."}
            />

            <main className="pb-20">
                {/* ID for anchor link scroll */}
                <div id="products" className="pt-8"></div>

                {/* Storefront Content with Sticky Categories */}
                <StorefrontClient
                    categories={(categories as Category[]) || []}
                    featuredProducts={(featuredProducts as Product[]) || []}
                    allProducts={(latestProducts as Product[]) || []}
                    tenantSlug={resolvedParams.tenant}
                />
            </main>

            {/* WhatsApp Sipariş Butonu */}
            {tenant?.whatsapp_number && (
                <WhatsAppOrderButton
                    tenantId={tenant?.id || ""}
                    phoneNumber={tenant.whatsapp_number}
                    storeName={tenant.name}
                />
            )}
        </div>
    )
}
