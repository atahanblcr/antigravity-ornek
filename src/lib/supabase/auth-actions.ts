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

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
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

    // 1. Önce tenant oluştur (admin client ile)
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
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
