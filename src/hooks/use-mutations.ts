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

    // HEIC/HEIF kontrolü ve dönüşümü
    let fileToUpload = file
    const isHeic = file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif') ||
        file.type === 'image/heic' ||
        file.type === 'image/heif'

    if (isHeic) {
        try {
            console.log('Converting HEIC to JPEG...')
            const heic2any = (await import("heic2any")).default
            const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8
            }) as Blob

            // Blob'u File objesine çevir
            fileToUpload = new File(
                [convertedBlob],
                file.name.replace(/\.(heic|heif)$/i, '.jpg'),
                { type: "image/jpeg" }
            )
            console.log('Conversion successful:', fileToUpload.name)
        } catch (e) {
            console.error('HEIC conversion failed:', e)
            throw new Error('HEIC görseli dönüştürülemedi. Lütfen JPG veya PNG formatında yükleyiniz.')
        }
    }

    const fileExt = fileToUpload.name.split('.').pop()
    const fileName = `${tenantId}/${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, fileToUpload)

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
    images?: string[]
    attributes?: Record<string, string>
    is_active?: boolean
    is_featured?: boolean
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
                    images: imageUrl ? [imageUrl] : [],
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
                const url = await uploadProductImage(imageFile, tenantId)
                updateData.images = [url]
                delete updateData.image_url
            }

            console.log("[UPDATE] Updating product:", id, updateData)

            const result = await supabase
                .from("products")
                .update(updateData)
                .eq("id", id)
                .select()

            console.log("[UPDATE] Result:", result)

            if (result.error) {
                console.error("[UPDATE] Error:", result.error)
                throw result.error
            }
            if (!result.data || result.data.length === 0) {
                console.error("[UPDATE] No rows affected")
                throw new Error("Ürün bulunamadı veya güncelleme yetkisi yok")
            }

            return { id }
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
    const router = useRouter()

    return useMutation({
        mutationFn: async (productId: string) => {
            const supabase = getSupabase()

            // Soft delete - Reference.md Bölüm 8.2
            console.log("[DELETE] Deleting product:", productId)

            const result = await supabase
                .from("products")
                .update({ deleted_at: new Date().toISOString(), is_active: false })
                .eq("id", productId)
                .select()

            console.log("[DELETE] Result:", result)

            if (result.error) {
                console.error("[DELETE] Error:", result.error)
                throw result.error
            }
            if (!result.data || result.data.length === 0) {
                console.error("[DELETE] No rows affected")
                throw new Error("Ürün bulunamadı veya silme yetkisi yok")
            }

            return { id: productId }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            addToast("Ürün başarıyla silindi", "success")
            router.push("/dashboard/products")
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
            queryClient.invalidateQueries({
                queryKey: ["categories"],
                exact: false
            })
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
            queryClient.invalidateQueries({
                queryKey: ["categories"],
                exact: false
            })
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
            const { data, error } = await supabase
                .from("categories")
                .update({ deleted_at: new Date().toISOString(), is_active: false })
                .eq("id", categoryId)
                .select()



            if (error) {

                throw error
            }

            // Eğer data boşsa, RLS politikası izin vermemiş demektir
            if (!data || data.length === 0) {
                throw new Error('Kategori güncellenemedi. Yetki hatası olabilir.')
            }

            return categoryId
        },
        onSuccess: () => {

            addToast("Kategori başarıyla silindi", "success")

            // Sayfayı tamamen yenile
            setTimeout(() => {
                window.location.reload()
            }, 500) // Toast mesajını göstermek için kısa bir gecikme
        },
        onError: (error: Error) => {

            addToast(`Hata: ${error.message}`, "error")
        }
    })
}

