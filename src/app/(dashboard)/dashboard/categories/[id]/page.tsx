import * as React from "react"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryEditForm } from "./category-edit-form"
import type { Category } from "@/types"

interface PageProps {
    params: Promise<{ id: string }>
}

/**
 * Kategori Düzenleme Sayfası (Server Component)
 */
export default async function CategoryEditPage({ params }: PageProps) {
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

    // Kategoriyi çek
    const { data: category, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !category) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/categories">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Kategori Düzenle</h1>
                    <p className="text-muted-foreground">{category.name}</p>
                </div>
            </div>

            {/* Form */}
            <CategoryEditForm category={category as Category} />
        </div>
    )
}
