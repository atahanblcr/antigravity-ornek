"use server"

import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Supabase Auth Server Actions
 * Reference.md Bölüm 2 - Çok kiracılı güvenlik
 */

// Sunucu tarafı Supabase client
async function getSupabase() {
    const cookieStore = await cookies()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error("Supabase credentials not configured")
    }

    return createServerClient(
        url,
        key,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server Component'te cookie set edilemez
                    }
                },
            },
        }
    )
}

/**
 * Giriş yap
 */
export async function login(formData: FormData) {
    const supabase = await getSupabase()

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    redirect("/dashboard")
}

/**
 * Kayıt ol
 */
export async function register(formData: FormData) {
    const supabase = await getSupabase()

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const storeName = formData.get("storeName") as string
    const storeSlug = formData.get("storeSlug") as string
    const whatsappNumber = formData.get("whatsappNumber") as string

    // Service Role Key kontrolü
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
        return { error: "Supabase yapılandırılmamış" }
    }

    // 1. Önce tenant oluştur (admin veya anon client ile)
    // NOT: Anon client kullanılıyorsa RLS tenants tablosunda INSERT izni olmalı
    const adminSupabase = createClient(
        supabaseUrl,
        serviceRoleKey || anonKey // Service role yoksa anon key kullan
    )

    const { data: tenant, error: tenantError } = await adminSupabase
        .from("tenants")
        .insert({
            name: storeName,
            slug: storeSlug,
            whatsapp_number: whatsappNumber,
        })
        .select()
        .single()

    if (tenantError) {
        return { error: "Mağaza oluşturulamadı: " + tenantError.message }
    }

    // 2. Kullanıcı oluştur (tenant_id metadata ile)
    const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                tenant_id: tenant.id,
                full_name: storeName,
                role: "owner",
            },
        },
    })

    if (signUpError) {
        // Tenant'ı geri al
        await adminSupabase.from("tenants").delete().eq("id", tenant.id)
        return { error: signUpError.message }
    }

    redirect("/login?registered=true")
}

/**
 * Çıkış yap
 */
export async function logout() {
    const supabase = await getSupabase()
    await supabase.auth.signOut()
    redirect("/login")
}

/**
 * Mevcut kullanıcıyı getir
 */
export async function getCurrentUser() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
