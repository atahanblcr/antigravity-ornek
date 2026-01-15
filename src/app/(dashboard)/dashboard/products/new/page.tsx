"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Save, Loader2, Upload } from "lucide-react"
import { useCreateProduct } from "@/hooks/use-mutations"
import { createBrowserClient } from "@supabase/ssr"
import type { Category, AttributeSchema } from "@/types"

// Slug helper
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 7)
}

// Zod şeması
const productSchema = z.object({
    name: z.string().min(1, "Ürün adı zorunludur"),
    description: z.string().optional(),
    base_price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
    sale_price: z.number().min(0).optional().nullable(),
    sku: z.string().optional(),
    category_id: z.string().optional(),
    is_active: z.boolean(),
    is_featured: z.boolean().default(false),
})

type ProductFormData = z.infer<typeof productSchema>

/**
 * Yeni Ürün Ekleme Sayfası
 * Kategori seçimi ve dinamik özellikler
 */
export default function NewProductPage() {
    const router = useRouter()
    const { mutate, isPending } = useCreateProduct()
    const [tenantId, setTenantId] = React.useState<string | null>(null)
    const [categories, setCategories] = React.useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)
    const [attributes, setAttributes] = React.useState<Record<string, string>>({})
    const [imageFile, setImageFile] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

    // Tenant ID ve kategorileri al
    React.useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !key) return

        const supabase = createBrowserClient(url, key)

        const fetchData = async () => {
            // User ve tenant
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            let tid = user.app_metadata?.tenant_id || user.user_metadata?.tenant_id
            if (!tid) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("tenant_id")
                    .eq("user_id", user.id)
                    .single()
                tid = profile?.tenant_id
            }
            if (tid) setTenantId(tid)

            // Kategorileri çek
            const { data: cats } = await supabase
                .from("categories")
                .select("*")
                .eq("is_active", true)
                .order("sort_order")

            if (cats) setCategories(cats as Category[])
        }

        fetchData()
    }, [])

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            base_price: 0,
            is_active: true,
            is_featured: false,
        },
    })

    // Kategori değiştiğinde
    const categoryId = watch("category_id")
    React.useEffect(() => {
        const cat = categories.find(c => c.id === categoryId)
        setSelectedCategory(cat || null)
        setAttributes({}) // Reset attributes
    }, [categoryId, categories])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleAttributeChange = (key: string, value: string) => {
        setAttributes(prev => ({ ...prev, [key]: value }))
    }

    const onSubmit = (data: ProductFormData) => {
        if (!tenantId) return

        // SKU otomatik oluştur (eğer kullanıcı girmemişse)
        let sku = data.sku
        if (!sku || sku.trim() === "") {
            // Kategori slug'ından prefix al veya "PRD" kullan
            const prefix = selectedCategory?.slug?.substring(0, 3).toUpperCase() || "PRD"
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
            sku = `${prefix}-${randomPart}`
        }

        // Sale price: boş veya NaN ise null yap
        const sale_price = data.sale_price && !isNaN(data.sale_price) ? data.sale_price : null

        const submitData = {
            ...data,
            sale_price,
            sku,
            slug: generateSlug(data.name),
            attributes,
        }

        mutate({ data: submitData, imageFile: imageFile || undefined, tenantId })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/products">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Temel Bilgiler */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ürün Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Kategori Seçimi */}
                        <div className="space-y-2">
                            <Label htmlFor="category_id">
                                Kategori <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="category_id"
                                {...register("category_id")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Kategori Seçin</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Ürün Adı <span className="text-destructive">*</span>
                                </Label>
                                <Input id="name" {...register("name")} placeholder="Örn: Yazlık T-Shirt" />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">Stok Kodu (SKU) - Opsiyonel</Label>
                                <Input id="sku" {...register("sku")} placeholder="Boş bırakılırsa otomatik oluşturulur" />
                                <p className="text-xs text-muted-foreground">
                                    Boş bırakırsanız sistem otomatik kod oluşturur
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <textarea
                                id="description"
                                {...register("description")}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Ürün açıklaması..."
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="base_price">
                                    Fiyat (₺) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="base_price"
                                    type="number"
                                    step="0.01"
                                    {...register("base_price", { valueAsNumber: true })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sale_price">İndirimli Fiyat (₺)</Label>
                                <Input
                                    id="sale_price"
                                    type="number"
                                    step="0.01"
                                    {...register("sale_price", { valueAsNumber: true })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    {...register("is_active")}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="is_active">Aktif (Vitrinde görünür)</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    {...register("is_featured")}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="is_featured">Kampanyalı Ürün (Ana sayfada öne çıkar)</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dinamik Özellikler - Kategoriye göre */}
                {selectedCategory?.attribute_schema && selectedCategory.attribute_schema.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ürün Özellikleri</CardTitle>
                            <CardDescription>
                                {selectedCategory.name} kategorisine özel özellikler
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                {selectedCategory.attribute_schema.map((attr: AttributeSchema) => (
                                    <div key={attr.key} className="space-y-2">
                                        <Label>
                                            {attr.key}
                                            {attr.required && <span className="text-destructive"> *</span>}
                                        </Label>
                                        {attr.type === "select" && attr.options ? (
                                            <select
                                                value={attributes[attr.key] || ""}
                                                onChange={e => handleAttributeChange(attr.key, e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">Seçin...</option>
                                                {attr.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : attr.type === "number" ? (
                                            <Input
                                                type="number"
                                                value={attributes[attr.key] || ""}
                                                onChange={e => handleAttributeChange(attr.key, e.target.value)}
                                            />
                                        ) : (
                                            <Input
                                                value={attributes[attr.key] || ""}
                                                onChange={e => handleAttributeChange(attr.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Görsel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ürün Görseli</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <div className="h-32 w-32 relative border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                                ) : (
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Input type="file" accept="image/*" onChange={handleImageChange} />
                                <p className="text-xs text-muted-foreground">Max 5MB. JPG, PNG.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex gap-3">
                    <Button type="submit" disabled={isPending || !tenantId}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Kaydet
                            </>
                        )}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/products">İptal</Link>
                    </Button>
                </div>
            </form>
        </div>
    )
}
