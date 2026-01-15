"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateCategory, useDeleteCategory } from "@/hooks/use-mutations"
import { Loader2, Trash2, Save, Plus, X } from "lucide-react"
import type { Category } from "@/types"

// Attribute Schema Validation
const attributeSchemaItem = z.object({
    key: z.string().min(1, "Özellik adı zorunludur"),
    type: z.enum(["text", "select", "number"], {
        message: "Tip seçilmelidir",
    }),
    options: z.array(z.string()).optional(),
    required: z.boolean().default(false),
})

const categorySchema = z.object({
    name: z.string().min(1, "Kategori adı zorunludur"),
    slug: z.string().min(1, "URL slug zorunludur"),
    description: z.string().optional(),
    is_active: z.boolean(),
    attribute_schema: z.array(attributeSchemaItem).default([]),
}).refine(
    (data) => {
        // Select tipindeki her özellik için options kontrolü
        return data.attribute_schema.every((attr) => {
            if (attr.type === "select") {
                return attr.options && attr.options.length > 0
            }
            return true
        })
    },
    {
        message: "Select tipindeki özellikler için en az bir seçenek girilmelidir",
        path: ["attribute_schema"],
    }
)

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryEditFormProps {
    category: Category
}

/**
 * Kategori Düzenleme Formu
 */
export function CategoryEditForm({ category }: CategoryEditFormProps) {
    const updateCategory = useUpdateCategory()
    const deleteCategory = useDeleteCategory()
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema) as any,
        defaultValues: {
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            is_active: category.is_active,
            attribute_schema: category.attribute_schema || [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attribute_schema",
    })

    const onSubmit = (data: CategoryFormData) => {
        updateCategory.mutate({
            id: category.id,
            data,
        })
    }

    const handleDelete = () => {
        deleteCategory.mutate(category.id)
    }

    const addAttribute = () => {
        append({
            key: "",
            type: "text",
            options: [],
            required: false,
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Kategori Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Ad */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Kategori Adı *</Label>
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

                    {/* Aktif */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            {...register("is_active")}
                            className="h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor="is_active">Aktif (Vitrinde görünür)</Label>
                    </div>
                </CardContent>
            </Card>

            {/* Attribute Schema */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Ürün Özellikleri</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                            <Plus className="h-4 w-4 mr-2" />
                            Özellik Ekle
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Bu kategorideki ürünler için özel özellikler tanımlayın (Beden, Renk, Marka vb.)
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Henüz özellik eklenmemiş. Yukarıdaki butona tıklayarak özellik ekleyebilirsiniz.
                        </p>
                    ) : (
                        fields.map((field, index) => {
                            const attributeType = watch(`attribute_schema.${index}.type`)
                            const optionsValue = watch(`attribute_schema.${index}.options`)

                            return (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Özellik Adı */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`attribute_schema.${index}.key`}>
                                                    Özellik Adı *
                                                </Label>
                                                <Input
                                                    id={`attribute_schema.${index}.key`}
                                                    {...register(`attribute_schema.${index}.key`)}
                                                    placeholder="Örn: Beden, Renk, Marka"
                                                />
                                                {errors.attribute_schema?.[index]?.key && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.attribute_schema[index]?.key?.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Tip */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`attribute_schema.${index}.type`}>
                                                    Tip *
                                                </Label>
                                                <select
                                                    id={`attribute_schema.${index}.type`}
                                                    {...register(`attribute_schema.${index}.type`)}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                >
                                                    <option value="text">Metin</option>
                                                    <option value="number">Sayı</option>
                                                    <option value="select">Seçim Listesi</option>
                                                </select>
                                                {errors.attribute_schema?.[index]?.type && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.attribute_schema[index]?.type?.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sil Butonu */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Seçenekler (sadece select tipinde) */}
                                    {attributeType === "select" && (
                                        <div className="space-y-2">
                                            <Label htmlFor={`attribute_schema.${index}.options`}>
                                                Seçenekler (virgülle ayırın) *
                                            </Label>
                                            <Input
                                                id={`attribute_schema.${index}.options`}
                                                placeholder="Örn: XS, S, M, L, XL"
                                                defaultValue={optionsValue?.join(", ") || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    const optionsArray = value
                                                        .split(",")
                                                        .map((opt) => opt.trim())
                                                        .filter((opt) => opt.length > 0)
                                                    // setValue ile form state'ini güncelle
                                                    setValue(`attribute_schema.${index}.options`, optionsArray, {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    })
                                                }}
                                            />
                                            {errors.attribute_schema?.[index]?.options && (
                                                <p className="text-sm text-destructive">
                                                    {errors.attribute_schema[index]?.options?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Zorunlu */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`attribute_schema.${index}.required`}
                                            {...register(`attribute_schema.${index}.required`)}
                                            className="h-4 w-4 rounded border-input"
                                        />
                                        <Label htmlFor={`attribute_schema.${index}.required`}>
                                            Bu özellik zorunlu
                                        </Label>
                                    </div>
                                </div>
                            )
                        })
                    )}

                    {/* Genel Hata Mesajı */}
                    {errors.attribute_schema && typeof errors.attribute_schema.message === "string" && (
                        <p className="text-sm text-destructive">{errors.attribute_schema.message}</p>
                    )}
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
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending ? (
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

                <Button type="submit" disabled={!isDirty || updateCategory.isPending}>
                    {updateCategory.isPending ? (
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
