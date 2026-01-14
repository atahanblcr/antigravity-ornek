import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Sipariş Olayı API
 * Reference.md Bölüm 6.2 - Analitik için sipariş olayı kaydı
 * 
 * POST /api/events
 * Body: { type: "order_initiated", tenant_id, metadata }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, tenant_id, metadata } = body

        if (!type || !tenant_id) {
            return NextResponse.json(
                { error: "type ve tenant_id zorunludur" },
                { status: 400 }
            )
        }

        // Supabase client (sunucu tarafı)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            // Supabase yapılandırılmamış, sadece log
            console.log("[Event]", { type, tenant_id, metadata })
            return NextResponse.json({ success: true, logged: true })
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // order_events tablosuna kaydet
        const { error } = await supabase.from("order_events").insert({
            tenant_id,
            event_type: type,
            payload: metadata || {},
        })

        if (error) {
            console.error("[Event Error]", error)
            return NextResponse.json(
                { error: "Olay kaydedilemedi" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: "Geçersiz istek" },
            { status: 400 }
        )
    }
}
