"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Loader2, CheckCircle } from "lucide-react"
import { login } from "@/lib/supabase/auth-actions"
import { Suspense } from "react"

function LoginForm() {
    const searchParams = useSearchParams()
    const registered = searchParams.get("registered")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md glass-panel">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary-foreground" />
                    </div>
                </div>
                <CardTitle className="text-2xl">Dijital Vitrin</CardTitle>
                <CardDescription>
                    Hesabınıza giriş yapın
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Kayıt başarılı mesajı */}
                {registered && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Kayıt başarılı! E-postanızı doğrulayın ve giriş yapın.
                    </div>
                )}

                {/* Hata mesajı */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Şifre</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Şifremi Unuttum
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Giriş yapılıyor...
                            </>
                        ) : (
                            "Giriş Yap"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Hesabınız yok mu? </span>
                    <Link href="/register" className="text-primary hover:underline">
                        Kayıt Ol
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Login Sayfası
 * Reference.md - Glassmorphism estetiği
 */
export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
            <Suspense fallback={<div className="text-center">Yükleniyor...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
