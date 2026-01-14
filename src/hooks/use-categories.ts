import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@supabase/ssr"
import type { Category } from "@/types"

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    return createBrowserClient(url, key)
}

/**
 * Kategorileri çekme
 * Reference.md - tenant_id izolasyonu
 */
export function useCategories(tenantId: string) {
    return useQuery({
        queryKey: ["categories", tenantId],
        queryFn: async () => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase not configured")

            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("tenant_id", tenantId)
                .eq("is_active", true)
                .is("deleted_at", null)
                .order("sort_order", { ascending: true })

            if (error) throw error
            return data as Category[]
        },
        enabled: !!tenantId,
    })
}

/**
 * Kategori oluşturma
 */
export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (category: Omit<Category, "id" | "created_at" | "updated_at">) => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase not configured")

            const { data, error } = await supabase
                .from("categories")
                .insert(category)
                .select()
                .single()

            if (error) throw error
            return data as Category
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["categories", data.tenant_id] })
        },
    })
}

/**
 * Kategori güncelleme
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            tenantId,
            updates,
        }: {
            id: string
            tenantId: string
            updates: Partial<Category>
        }) => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase not configured")

            const { data, error } = await supabase
                .from("categories")
                .update(updates)
                .eq("id", id)
                .eq("tenant_id", tenantId)
                .select()
                .single()

            if (error) throw error
            return data as Category
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["categories", data.tenant_id] })
        },
    })
}

/**
 * Kategori silme (soft delete)
 * Reference.md Bölüm 8.2 - GDPR soft delete
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase not configured")

            const { error } = await supabase
                .from("categories")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id)
                .eq("tenant_id", tenantId)

            if (error) throw error
            return { id, tenantId }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["categories", data.tenantId] })
        },
    })
}
