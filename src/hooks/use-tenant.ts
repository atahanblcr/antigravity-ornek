import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@supabase/ssr"
import type { Tenant } from "@/types"

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    return createBrowserClient(url, key)
}

/**
 * Tenant bilgilerini çekme
 */
export function useTenant(slug: string) {
    return useQuery({
        queryKey: ["tenant", slug],
        queryFn: async () => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase not configured")

            const { data, error } = await supabase
                .from("tenants")
                .select("*")
                .eq("slug", slug)
                .eq("is_active", true)
                .single()

            if (error) throw error
            return data as Tenant
        },
        enabled: !!slug,
    })
}

/**
 * Tenant ayarlarını güncelleme
 */
export function useUpdateTenant() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            updates,
        }: {
            id: string
            updates: Partial<Tenant>
        }) => {
            const supabase = getSupabase()
            if (!supabase) throw new Error("Supabase not configured")

            const { data, error } = await supabase
                .from("tenants")
                .update(updates)
                .eq("id", id)
                .select()
                .single()

            if (error) throw error
            return data as Tenant
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tenant", data.slug] })
        },
    })
}
