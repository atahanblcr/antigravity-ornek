"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Save, Loader2 } from "lucide-react"
import { useCreateCategory } from "@/hooks/use-mutations"
import { createBrowserClient } from "@supabase/ssr"

// Zod şeması
const categorySchema = z.object({
    name: z.string().min(1, "Kategori adı zorunludur"),
    slug: z.string().min(1, "URL slug zorunludur").regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanılabilir"),
    description: z.string().optional(),
    sort_order: z.number().min(0),
    is_active: z.boolean(),
})

type CategoryFormData = z.infer<typeof categorySchema>

/**
 * Yeni Kategori Ekleme Sayfası
 */
export default function NewCategoryPage() {
    const router = useRouter()
    const { mutate, isPending } = useCreateCategory()
    const [tenantId, setTenantId] = React.useState<string | null>(null)

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
        watch,
        setValue,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            sort_order: 0,
            is_active: true,
        },
    })

    // İsimden slug otomatik oluştur
    const name = watch("name")
    React.useEffect(() => {
        if (!name) return
        const slug = name
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        setValue("slug", slug)
    }, [name, setValue])

    const onSubmit = (data: CategoryFormData) => {
        if (!tenantId) return
        mutate({ data, tenantId })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/categories">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Yeni Kategori Ekle</h1>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Kategori Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Kategori Adı <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="Örn: Elektronik"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">
                                    URL Slug <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    {...register("slug")}
                                    placeholder="elektronik"
                                />
                                {errors.slug && (
                                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Input
                                id="description"
                                {...register("description")}
                                placeholder="Kategori açıklaması"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Sıralama</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    {...register("sort_order", { valueAsNumber: true })}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    {...register("is_active")}
                                    className="h-4 w-4 rounded"
                                />
                                <Label htmlFor="is_active">Aktif</Label>
                            </div>
                        </div>

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
                                <Link href="/dashboard/categories">İptal</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
