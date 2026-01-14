import { useQuery } from "@tanstack/react-query"
import { createBrowserClient } from "@supabase/ssr"
import type { Product } from "@/types"

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    return createBrowserClient(url, key)
}

/**
 * Ürünleri çekme hook'u
 * Reference.md Bölüm 3.3 - JSONB @> operatörü ile filtreleme
 */
export function useProducts(tenantId: string, filters?: Record<string, string>) {
    return useQuery({
        queryKey: ["products", tenantId, filters],
        queryFn: async () => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase is not configured")

            let query = supabase
                .from("products")
                .select("*")
                .eq("tenant_id", tenantId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })

            // JSONB filtreleme - Reference.md Bölüm 3.3
            if (filters && Object.keys(filters).length > 0) {
                query = query.contains("attributes", filters)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Product[]
        },
        enabled: !!tenantId,
    })
}

/**
 * Fasetli arama için ayrık değerler
 */
export function useProductFacets(tenantId: string, attributeKey: string) {
    return useQuery({
        queryKey: ["facets", tenantId, attributeKey],
        queryFn: async () => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase is not configured")

            const { data, error } = await supabase
                .from("products")
                .select("attributes")
                .eq("tenant_id", tenantId)
                .eq("is_active", true)

            if (error) throw error

            const values = new Set<string>()
            for (const product of data || []) {
                const attrs = product.attributes as Record<string, string>
                if (attrs && attrs[attributeKey]) {
                    values.add(attrs[attributeKey])
                }
            }

            return Array.from(values).sort()
        },
        enabled: !!tenantId && !!attributeKey,
    })
}
