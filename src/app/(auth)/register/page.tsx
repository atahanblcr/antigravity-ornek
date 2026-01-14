"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Loader2 } from "lucide-react"
import { register } from "@/lib/supabase/auth-actions"

/**
 * Kayıt Sayfası
 * Reference.md - Glassmorphism estetiği
 */
export default function RegisterPage() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Slug otomatik oluşturma
    const [storeName, setStoreName] = React.useState("")
    const storeSlug = storeName
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)

        // Şifre kontrolü
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor")
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır")
            setIsLoading(false)
            return
        }

        // Slug ekle
        formData.set("storeSlug", storeSlug)

        const result = await register(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-8">
            <Card className="w-full max-w-md glass-panel">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                            <Store className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Dijital Vitrin</CardTitle>
                    <CardDescription>
                        Mağazanızı oluşturun ve satışa başlayın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Hata mesajı */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Mağaza Adı</Label>
                            <Input
                                id="storeName"
                                name="storeName"
                                placeholder="Örn: Güzel Mağaza"
                                required
                                disabled={isLoading}
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                            />
                            {storeSlug && (
                                <p className="text-xs text-muted-foreground">
                                    Vitrin URL: vitrin.com/<span className="font-medium">{storeSlug}</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">WhatsApp Numarası</Label>
                            <Input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                type="tel"
                                placeholder="+90 5XX XXX XX XX"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="ornek@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Şifre</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Oluşturuluyor...
                                </>
                            ) : (
                                "Kayıt Ol"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
                        <Link href="/login" className="text-primary hover:underline">
                            Giriş Yap
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
