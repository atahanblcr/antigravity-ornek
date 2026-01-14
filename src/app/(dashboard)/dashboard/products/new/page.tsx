"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Save, Loader2, Upload, Plus, Trash2 } from "lucide-react"
import { useCreateProduct } from "@/hooks/use-mutations"
import { createBrowserClient } from "@supabase/ssr"

// Zod şeması
const productSchema = z.object({
    name: z.string().min(1, "Ürün adı zorunludur"),
    description: z.string().optional(),
    base_price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
    sale_price: z.number().min(0).optional(),
    sku: z.string().optional(),
    category_id: z.string().optional(),
    is_active: z.boolean(),
    // Attributes dizisi: { key: "Renk", value: "Kırmızı" }
    attributes: z.array(z.object({
        key: z.string().min(1, "Özellik adı"),
        value: z.string().min(1, "Değer")
    })).optional()
})

type ProductFormData = z.infer<typeof productSchema>

/**
 * Yeni Ürün Ekleme Sayfası
 */
export default function NewProductPage() {
    const router = useRouter()
    const { mutate, isPending } = useCreateProduct()
    const [tenantId, setTenantId] = React.useState<string | null>(null)
    const [imageFile, setImageFile] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

    // Tenant ID'yi al
    React.useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) {
            console.error("Supabase credentials missing. Please check .env.local")
            return
        }

        const supabase = createBrowserClient(url, key)
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.app_metadata?.tenant_id) {
                setTenantId(user.app_metadata.tenant_id)
            }
        })
    }, [])

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            base_price: 0,
            is_active: true,
            attributes: []
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attributes"
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const onSubmit = (data: ProductFormData) => {
        if (!tenantId) return

        // Attributes array -> Record object transformation
        const attributesRecord: Record<string, string> = {}
        data.attributes?.forEach(attr => {
            attributesRecord[attr.key] = attr.value
        })

        // Mutate call assumes data has 'attributes' as Record, but our form data has array.
        // We need to overwrite it.
        const submitData = {
            ...data,
            attributes: attributesRecord
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

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Ürün Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Görsel Yükleme */}
                        <div className="space-y-2">
                            <Label>Ürün Görseli</Label>
                            <div className="flex items-start gap-4">
                                <div className="h-32 w-32 relative border rounded overflow-hidden bg-muted flex items-center justify-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Önizleme" className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-muted-foreground text-xs text-center p-2">Görsel Yok</span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="max-w-[250px]"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Max 2MB. JPG, PNG.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Temel Bilgiler */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Ürün Adı <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="Örn: Kablosuz Kulaklık"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">Stok Kodu (SKU)</Label>
                                <Input
                                    id="sku"
                                    {...register("sku")}
                                    placeholder="Örn: KLK-001"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <textarea
                                id="description"
                                {...register("description")}
                                placeholder="Ürün açıklaması..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Fiyat */}
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
                                    placeholder="0.00"
                                />
                                {errors.base_price && (
                                    <p className="text-sm text-destructive">{errors.base_price.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sale_price">İndirimli Fiyat (₺)</Label>
                                <Input
                                    id="sale_price"
                                    type="number"
                                    step="0.01"
                                    {...register("sale_price", { valueAsNumber: true })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Özellikler (Attributes) */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <Label>Ürün Özellikleri (Varyantlar)</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Özellik Ekle
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Özellik (örn: Renk)"
                                                {...register(`attributes.${index}.key`)}
                                            />
                                            {errors.attributes?.[index]?.key && (
                                                <p className="text-xs text-destructive mt-1">{errors.attributes[index]?.key?.message}</p>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Değer (örn: Kırmızı)"
                                                {...register(`attributes.${index}.value`)}
                                            />
                                            {errors.attributes?.[index]?.value && (
                                                <p className="text-xs text-destructive mt-1">{errors.attributes[index]?.value?.message}</p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded border border-dashed">
                                        Henüz özellik eklenmedi. Renk, beden gibi özellikler ekleyebilirsiniz.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Durum */}
                        <div className="flex items-center gap-2 pt-4 border-t">
                            <input
                                type="checkbox"
                                id="is_active"
                                {...register("is_active")}
                                className="h-4 w-4 rounded"
                            />
                            <Label htmlFor="is_active">Aktif (Vitrinde görünsün)</Label>
                        </div>

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
                </CardContent>
            </Card>
        </div>
    )
}
