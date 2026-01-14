import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error("Supabase credentials not configured")
    return createBrowserClient(url, key)
}

/**
 * Ürün Görseli Yükleme
 */
export async function uploadProductImage(file: File, tenantId: string) {
    const supabase = getSupabase()
    const fileExt = file.name.split('.').pop()
    const fileName = `${tenantId}/${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

    return publicUrl
}

// ============================================
// ÜRÜN MUTATIONS
// ============================================

interface ProductData {
    name: string
    slug: string
    description?: string
    base_price: number
    sale_price?: number | null
    category_id?: string
    sku?: string
    image_url?: string
    attributes?: Record<string, string>
    is_active?: boolean
}

/**
 * Ürün Oluşturma Mutasyonu
 */
export function useCreateProduct() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()
    const router = useRouter()

    return useMutation({
        mutationFn: async ({ data, imageFile, tenantId }: { data: ProductData; imageFile?: File; tenantId: string }) => {
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
        onError: (error: Error) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

/**
 * Ürün Güncelleme Mutasyonu
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()
    const router = useRouter()

    return useMutation({
        mutationFn: async ({ id, data, imageFile, tenantId }: { id: string; data: Partial<ProductData>; imageFile?: File; tenantId: string }) => {
            const supabase = getSupabase()

            let updateData = { ...data }

            if (imageFile) {
                updateData.image_url = await uploadProductImage(imageFile, tenantId)
            }

            const { data: product, error } = await supabase
                .from("products")
                .update(updateData)
                .eq("id", id)
                .select()
                .single()

            if (error) throw error
            return product
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            addToast("Ürün başarıyla güncellendi", "success")
            router.push("/dashboard/products")
        },
        onError: (error: Error) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

/**
 * Ürün Silme Mutasyonu (Soft Delete)
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()

    return useMutation({
        mutationFn: async (productId: string) => {
            const supabase = getSupabase()

            // Soft delete - Reference.md Bölüm 8.2
            const { error } = await supabase
                .from("products")
                .update({ deleted_at: new Date().toISOString(), is_active: false })
                .eq("id", productId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            addToast("Ürün başarıyla silindi", "success")
        },
        onError: (error: Error) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

// ============================================
// KATEGORİ MUTATIONS
// ============================================

interface CategoryData {
    name: string
    slug: string
    description?: string
    image_url?: string
    parent_id?: string
    sort_order?: number
    is_active?: boolean
    attribute_schema?: Array<{ key: string; type: string; options?: string[]; required?: boolean }>
}

/**
 * Kategori Oluşturma Mutasyonu
 */
export function useCreateCategory() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()
    const router = useRouter()

    return useMutation({
        mutationFn: async ({ data, tenantId }: { data: CategoryData; tenantId: string }) => {
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
        onError: (error: Error) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

/**
 * Kategori Güncelleme Mutasyonu
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()
    const router = useRouter()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryData> }) => {
            const supabase = getSupabase()

            const { data: category, error } = await supabase
                .from("categories")
                .update(data)
                .eq("id", id)
                .select()
                .single()

            if (error) throw error
            return category
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            addToast("Kategori başarıyla güncellendi", "success")
            router.push("/dashboard/categories")
        },
        onError: (error: Error) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

/**
 * Kategori Silme Mutasyonu (Soft Delete)
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient()
    const { addToast } = useToast()

    return useMutation({
        mutationFn: async (categoryId: string) => {
            const supabase = getSupabase()

            // Soft delete
            const { error } = await supabase
                .from("categories")
                .update({ deleted_at: new Date().toISOString(), is_active: false })
                .eq("id", categoryId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            addToast("Kategori başarıyla silindi", "success")
        },
        onError: (error: Error) => {
            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

