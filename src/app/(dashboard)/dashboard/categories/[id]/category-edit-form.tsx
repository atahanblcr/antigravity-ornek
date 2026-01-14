"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateCategory, useDeleteCategory } from "@/hooks/use-mutations"
import { Loader2, Trash2, Save } from "lucide-react"
import type { Category } from "@/types"

const categorySchema = z.object({
    name: z.string().min(1, "Kategori adı zorunludur"),
    slug: z.string().min(1, "URL slug zorunludur"),
    description: z.string().optional(),
    is_active: z.boolean(),
})

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
        formState: { errors, isDirty },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema) as any,
        defaultValues: {
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            is_active: category.is_active,
        },
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
