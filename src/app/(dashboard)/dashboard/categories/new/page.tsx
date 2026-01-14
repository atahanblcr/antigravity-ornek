"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import { useCreateCategory } from "@/hooks/use-mutations"
import { createBrowserClient } from "@supabase/ssr"

// Özellik şeması tipi
const attributeSchemaItem = z.object({
    key: z.string().min(1, "Özellik adı zorunlu"),
    type: z.enum(["text", "select", "number"]),
    options: z.string().optional(), // Virgülle ayrılmış seçenekler
    required: z.boolean().optional(),
})

// Kategori şeması
const categorySchema = z.object({
    name: z.string().min(1, "Kategori adı zorunludur"),
    slug: z.string().min(1, "URL slug zorunludur").regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanılabilir"),
    description: z.string().optional(),
    sort_order: z.number().min(0),
    is_active: z.boolean(),
    attribute_schema: z.array(attributeSchemaItem).optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

/**
 * Yeni Kategori Ekleme Sayfası
 * Dinamik özellik şeması tanımlama desteği
 */
export default function NewCategoryPage() {
    const router = useRouter()
    const { mutate, isPending } = useCreateCategory()
    const [tenantId, setTenantId] = React.useState<string | null>(null)

    // Tenant ID'yi al
    React.useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) return

        const supabase = createBrowserClient(url, key)

        const getTenantId = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            if (user.app_metadata?.tenant_id) {
                setTenantId(user.app_metadata.tenant_id)
                return
            }
            if (user.user_metadata?.tenant_id) {
                setTenantId(user.user_metadata.tenant_id)
                return
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("tenant_id")
                .eq("user_id", user.id)
                .single()

            if (profile?.tenant_id) {
                setTenantId(profile.tenant_id)
            }
        }

        getTenantId()
    }, [])

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema) as any,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            sort_order: 0,
            is_active: true,
            attribute_schema: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attribute_schema",
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

        // Options string'i array'e çevir
        const processedSchema = data.attribute_schema?.map(attr => ({
            key: attr.key,
            type: attr.type,
            required: attr.required || false,
            options: attr.type === "select" && attr.options
                ? attr.options.split(",").map(o => o.trim()).filter(Boolean)
                : undefined,
        }))

        mutate({
            data: {
                ...data,
                attribute_schema: processedSchema,
            },
            tenantId,
        })
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Temel Bilgiler */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kategori Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Kategori Adı <span className="text-destructive">*</span>
                                </Label>
                                <Input id="name" {...register("name")} placeholder="Örn: Giyim" />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">
                                    URL Slug <span className="text-destructive">*</span>
                                </Label>
                                <Input id="slug" {...register("slug")} placeholder="giyim" />
                                {errors.slug && (
                                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Input id="description" {...register("description")} />
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
                    </CardContent>
                </Card>

                {/* Özellik Şeması */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ürün Özellikleri Şeması</CardTitle>
                        <CardDescription>
                            Bu kategorideki ürünlerin sahip olacağı özellikleri tanımlayın.
                            Örn: Giyim için Beden, Renk; Elektronik için Marka, Garanti
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/30">
                                <div className="flex-1 grid sm:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Özellik Adı</Label>
                                        <Input
                                            {...register(`attribute_schema.${index}.key`)}
                                            placeholder="Beden"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tip</Label>
                                        <select
                                            {...register(`attribute_schema.${index}.type`)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="text">Metin</option>
                                            <option value="select">Seçenekli</option>
                                            <option value="number">Sayı</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Seçenekler (virgülle ayırın)</Label>
                                        <Input
                                            {...register(`attribute_schema.${index}.options`)}
                                            placeholder="S, M, L, XL"
                                        />
                                    </div>
                                    <div className="flex items-end pb-2 gap-2">
                                        <input
                                            type="checkbox"
                                            {...register(`attribute_schema.${index}.required`)}
                                            className="h-4 w-4"
                                        />
                                        <Label className="text-xs">Zorunlu</Label>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ key: "", type: "text", options: "", required: false })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Özellik Ekle
                        </Button>
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
                        <Link href="/dashboard/categories">İptal</Link>
                    </Button>
                </div>
            </form>
        </div>
    )
}
