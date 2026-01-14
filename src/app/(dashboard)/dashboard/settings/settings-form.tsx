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
import { Store, Save, Loader2, Upload, ExternalLink } from "lucide-react"
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

    const {
        register,
        handleSubmit,
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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
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

            // Tenant güncelle
            const { error } = await supabase
                .from("tenants")
                .update({
                    ...data,
                    logo_url: logoUrl,
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
                                Max 2MB. JPG, PNG.
                            </p>
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
                <Button type="submit" disabled={(!isDirty && !logoFile) || isPending}>
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
