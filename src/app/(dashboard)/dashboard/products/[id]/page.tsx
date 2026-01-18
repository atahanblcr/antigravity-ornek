import * as React from "react"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductEditForm } from "./product-edit-form"
import type { Product, Category } from "@/types"

interface PageProps {
    params: Promise<{ id: string }>
}

/**
 * Ürün Düzenleme Sayfası (Server Component)
 */
export default async function ProductEditPage({ params }: PageProps) {
    const { id } = await params

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        notFound()
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() { },
            },
        }
    )

    // Ürünü çek
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !product) {
        notFound()
    }

    // Kategorileri çek
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name, attribute_schema")
        .eq("tenant_id", product.tenant_id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("name")

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/products">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
                    <p className="text-muted-foreground">{product.name}</p>
                </div>
            </div>

            {/* Form */}
            <ProductEditForm
                product={product as Product}
                categories={(categories || []) as Category[]}
            />
        </div>
    )
}
