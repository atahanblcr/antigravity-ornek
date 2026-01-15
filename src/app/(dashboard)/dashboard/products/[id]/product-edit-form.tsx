"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateProduct, useDeleteProduct } from "@/hooks/use-mutations"
import { Loader2, Trash2, Save } from "lucide-react"
import type { Product, Category } from "@/types"

const productSchema = z.object({
    name: z.string().min(1, "Ürün adı zorunludur"),
    slug: z.string().min(1, "URL slug zorunludur"),
    description: z.string().optional(),
    base_price: z.number().min(0, "Fiyat 0 veya daha büyük olmalıdır"),
    sale_price: z.number().min(0).optional().nullable(),
    category_id: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    is_active: z.boolean(),
    is_featured: z.boolean().default(false),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductEditFormProps {
    product: Product
    categories: Category[]
}

/**
 * Ürün Düzenleme Formu
 */
export function ProductEditForm({ product, categories }: ProductEditFormProps) {
    const updateProduct = useUpdateProduct()
    const deleteProduct = useDeleteProduct()
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: product.name,
            slug: product.slug,
            description: product.description || "",
            base_price: product.base_price,
            sale_price: product.sale_price ?? null,
            category_id: product.category_id ?? null,
            sku: product.sku ?? null,
            is_active: product.is_active,
            is_featured: product.is_featured ?? false,
        },
    })

    const onSubmit = (data: ProductFormData) => {
        // Sale price: boş veya NaN ise null yap
        const sale_price = data.sale_price && !isNaN(data.sale_price) ? data.sale_price : null

        updateProduct.mutate({
            id: product.id,
            data: {
                ...data,
                sale_price,
                category_id: data.category_id || undefined,
                sku: data.sku || undefined,
            },
            tenantId: product.tenant_id,
        })
    }

    const handleDelete = () => {
        deleteProduct.mutate(product.id)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ürün Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Ad */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Ürün Adı *</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug *</Label>
                        <Input id="slug" {...register("slug")} />
                        {errors.slug && (
                            <p className="text-sm text-destructive">{errors.slug.message}</p>
                        )}
                    </div>

                    {/* Açıklama */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <textarea
                            id="description"
                            {...register("description")}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label htmlFor="category_id">Kategori</Label>
                        <select
                            id="category_id"
                            {...register("category_id")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Kategori Seçin</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fiyatlar */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="base_price">Fiyat (₺) *</Label>
                            <Input
                                id="base_price"
                                type="number"
                                step="0.01"
                                {...register("base_price", { valueAsNumber: true })}
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
                            />
                        </div>
                    </div>

                    {/* SKU */}
                    <div className="space-y-2">
                        <Label htmlFor="sku">Stok Kodu (SKU)</Label>
                        <Input id="sku" {...register("sku")} />
                    </div>

                    {/* Aktif */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                {...register("is_active")}
                                className="h-4 w-4 rounded border-input"
                            />
                            <Label htmlFor="is_active">Aktif (Vitrinde görünür)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_featured"
                                {...register("is_featured")}
                                className="h-4 w-4 rounded border-input"
                            />
                            <Label htmlFor="is_featured">Kampanyalı Ürün (Ana sayfada öne çıkar)</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
                {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-destructive">Silmek istediğinize emin misiniz?</span>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleteProduct.isPending}
                        >
                            {deleteProduct.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Evet, Sil"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            İptal
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                    </Button>
                )}

                <Button type="submit" disabled={!isDirty || updateProduct.isPending}>
                    {updateProduct.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Kaydet
                </Button>
            </div>
        </form>
    )
}
