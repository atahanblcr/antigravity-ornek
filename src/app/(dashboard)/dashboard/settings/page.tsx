import * as React from "react"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { SettingsForm } from "./settings-form"
import type { Tenant } from "@/types"

/**
 * Mağaza Ayarları Sayfası (Server Component)
 */
export default async function SettingsPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Supabase yapılandırılmamış
            </div>
        )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() { },
            },
        }
    )

    // Kullanıcı bilgisi al
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Giriş yapmanız gerekiyor
            </div>
        )
    }

    // Profile'dan tenant_id al
    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", user.id)
        .single()

    if (!profile) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Profil bulunamadı
            </div>
        )
    }

    // Tenant bilgilerini çek
    const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", profile.tenant_id)
        .single()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Mağaza Ayarları</h1>
                <p className="text-muted-foreground">
                    Mağaza bilgilerinizi ve tercihlerinizi yönetin
                </p>
            </div>

            {/* Settings Form */}
            <SettingsForm tenant={tenant as Tenant} />
        </div>
    )
}
