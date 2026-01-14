import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

const getSupabase = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

/**
 * Ürün Görseli Yükleme
 */
export async function uploadProductImage(file: File, tenantId: string) {
    const supabase = getSupabase()
    const fileExt = file.name.split('.').pop()
    const fileName = `${tenantId}/${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

    return publicUrl
}

/**
 * Ürün Oluşturma Mutasyonu
 * Reference.md Bölüm 7.2 - Veri Mutasyonları
 */
export function useCreateProduct() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()
    const router = useRouter()

    return useMutation({
        mutationFn: async ({ data, imageFile, tenantId }: { data: any, imageFile?: File, tenantId: string }) => {
            const supabase = getSupabase()

            let imageUrl = null
            if (imageFile) {
                imageUrl = await uploadProductImage(imageFile, tenantId)
            }

            const { data: product, error } = await supabase
                .from("products")
                .insert({
                    ...data,
                    tenant_id: tenantId,
                    image_url: imageUrl,
                    attributes: data.attributes || {}
                })
                .select()
                .single()

            if (error) throw error
            return product
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            addToast("Ürün başarıyla oluşturuldu", "success")
            router.push("/dashboard/products")
        },
        onError: (error: any) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

/**
 * Kategori Oluşturma Mutasyonu
 */
export function useCreateCategory() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()
    const router = useRouter()

    return useMutation({
        mutationFn: async ({ data, tenantId }: { data: any, tenantId: string }) => {
            const supabase = getSupabase()

            const { data: category, error } = await supabase
                .from("categories")
                .insert({
                    ...data,
                    tenant_id: tenantId
                })
                .select()
                .single()

            if (error) throw error
            return category
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            addToast("Kategori başarıyla oluşturuldu", "success")
            router.push("/dashboard/categories")
        },
        onError: (error: any) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}
