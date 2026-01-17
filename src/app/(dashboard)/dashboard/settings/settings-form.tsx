"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { Store, Save, Loader2, ExternalLink, Image as ImageIcon, Info } from "lucide-react"
import { slugify } from "@/lib/utils"
import type { Tenant } from "@/types"

const settingsSchema = z.object({
    name: z.string().min(1, "Mağaza adı zorunludur"),
    slug: z.string().min(1, "URL slug zorunludur"),
    description: z.string().optional(),
    whatsapp_number: z.string().min(10, "Geçerli bir telefon numarası girin"),
    location: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    tenant: Tenant
}

/**
 * Mağaza Ayarları Formu
 */
export function SettingsForm({ tenant }: SettingsFormProps) {
    const { addToast } = useToast()
    const [isPending, setIsPending] = React.useState(false)
    const [logoFile, setLogoFile] = React.useState<File | null>(null)
    const [logoPreview, setLogoPreview] = React.useState<string | null>(tenant?.logo_url || null)
    const [heroFile, setHeroFile] = React.useState<File | null>(null)
    const [heroPreview, setHeroPreview] = React.useState<string | null>(tenant?.hero_image_url || null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema) as any,
        defaultValues: {
            name: tenant?.name || "",
            slug: tenant?.slug || "",
            description: tenant?.description || "",
            whatsapp_number: tenant?.whatsapp_number || "",
            location: tenant?.location || "",
        },
    })

    // Mağaza adı değiştiğinde slug'ı otomatik güncelle
    const name = watch("name")

    React.useEffect(() => {
        if (name) {
            // Sadece kullanıcı slug alanını manuel olarak hiç değiştirmediyse veya 
            // basit bir varsayım olarak her zaman ad değiştiğinde slug'ı güncelle
            // Kullanıcının manuel düzenlemesine izin vermek için bir flag tutulabilir
            // ancak şimdilik basit yaklaşım: ad değişirse slug da değişir.
            const newSlug = slugify(name)

            // Mevcut slug ile aynıysa güncelleme (döngüyü önle)
            // Ancak setValue zaten aynıysa render tetiklemez genellikle
            // Yine de kontrol edelim
            setValue("slug", newSlug, {
                shouldValidate: true,
                shouldDirty: true
            })
        }
    }, [name, setValue])


    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Dosya boyutu kontrolü (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                addToast("Hero görseli 5MB'dan küçük olmalıdır", "error")
                return
            }
            setHeroFile(file)
            setHeroPreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (data: SettingsFormData) => {
        setIsPending(true)

        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            if (!url || !key) throw new Error("Supabase yapılandırılmamış")

            const supabase = createBrowserClient(url, key)

            let logoUrl = tenant?.logo_url
            let heroImageUrl = tenant?.hero_image_url

            // Logo yükle
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop()
                const fileName = `${tenant.id}/logo.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from("products")
                    .upload(fileName, logoFile, { upsert: true })

                if (uploadError) throw uploadError

                const { data: publicData } = supabase.storage
                    .from("products")
                    .getPublicUrl(fileName)

                logoUrl = publicData.publicUrl
            }

            // Hero görseli yükle
            if (heroFile) {
                const fileExt = heroFile.name.split('.').pop()
                const fileName = `${tenant.id}/hero.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from("products")
                    .upload(fileName, heroFile, { upsert: true })

                if (uploadError) throw uploadError

                const { data: publicData } = supabase.storage
                    .from("products")
                    .getPublicUrl(fileName)

                heroImageUrl = publicData.publicUrl
            }

            // Tenant güncelle
            const { error } = await supabase
                .from("tenants")
                .update({
                    ...data,
                    logo_url: logoUrl,
                    hero_image_url: heroImageUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", tenant.id)

            if (error) throw error

            addToast("Ayarlar başarıyla kaydedildi", "success")
        } catch (error: any) {
            addToast(`Hata: ${error.message}`, "error")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Genel Bilgiler */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Genel Bilgiler
                    </CardTitle>
                    <CardDescription>
                        Mağazanızın temel bilgilerini güncelleyin
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Mağaza Adı *</Label>
                            <Input id="name" {...register("name")} />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug *</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                                    vitrin.com/
                                </span>
                                <Input
                                    id="slug"
                                    {...register("slug")}
                                    className="rounded-l-none"
                                />
                            </div>
                            {errors.slug && (
                                <p className="text-sm text-destructive">{errors.slug.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <textarea
                            id="description"
                            {...register("description")}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Mağazanız hakkında kısa bir açıklama..."
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp_number">WhatsApp Numarası *</Label>
                            <Input
                                id="whatsapp_number"
                                type="tel"
                                {...register("whatsapp_number")}
                                placeholder="+905551234567"
                            />
                            {errors.whatsapp_number && (
                                <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Konum</Label>
                            <Input
                                id="location"
                                {...register("location")}
                                placeholder="İstanbul, Türkiye"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logo */}
            <Card>
                <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>
                        Mağaza logonuzu yükleyin (Önerilen: 200x200px)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="h-24 w-24 relative border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="object-cover w-full h-full" />
                            ) : (
                                <Store className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="max-w-[250px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Max 2MB. JPG, PNG, WebP.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hero Görseli */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Hero Görseli (Ana Sayfa Arka Plan)
                    </CardTitle>
                    <CardDescription>
                        Vitrin ana sayfasında görünecek arka plan görseli
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Preview */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-blue-600/10 border-2 border-dashed border-primary/20">
                        {heroPreview ? (
                            <>
                                <img
                                    src={heroPreview}
                                    alt="Hero Preview"
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold drop-shadow-lg">
                                        {tenant?.name || "Mağaza Adı"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-8">
                                <ImageIcon className="h-16 w-16 opacity-30" />
                                <span className="text-center">Hero görseli yüklemek için aşağıdan dosya seçin</span>
                            </div>
                        )}
                    </div>

                    {/* Upload */}
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                            <Input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleHeroChange}
                            />
                        </div>
                    </div>

                    {/* Format Info */}
                    <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-semibold mb-1">Önerilen Format:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-xs">
                                <li><strong>Boyut:</strong> 1920x1080 piksel (16:9 oran)</li>
                                <li><strong>Format:</strong> WebP veya JPG (en iyi sıkıştırma)</li>
                                <li><strong>Dosya Boyutu:</strong> Maksimum 5MB</li>
                                <li><strong>İpucu:</strong> Görsel hafif bulanıklaştırılarak gösterilir, bu yüzden çok detaylı olmak zorunda değil</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vitrin Linki */}
            <Card>
                <CardHeader>
                    <CardTitle>Vitrin Linki</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <code className="flex-1 px-4 py-2 bg-muted rounded-md text-sm">
                            {typeof window !== "undefined" ? window.location.origin : ""}
                            /{tenant?.slug || "demo"}
                        </code>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(`/${tenant?.slug}`, "_blank")}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Görüntüle
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end">
                <Button type="submit" disabled={(!isDirty && !logoFile && !heroFile) || isPending}>
                    {isPending ? (
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
