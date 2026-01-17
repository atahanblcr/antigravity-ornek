import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

/**
 * Analytics Events API
 * Reference.md Bölüm 6.2 - Durumsuz Sipariş Analitikleri
 * 
 * POST /api/events - Yeni event kaydet
 * GET /api/events - Tenant event'larını listele (auth gerekli)
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        // Hem eski format (type) hem yeni format (event_type) destekle
        const tenant_id = body.tenant_id
        const event_type = body.event_type || body.type
        const cart_data = body.cart_data || body.metadata || body.payload || {}
        const session_id = body.session_id

        // Validasyon
        if (!tenant_id || !event_type) {
            return NextResponse.json(
                { error: "tenant_id ve event_type zorunludur" },
                { status: 400 }
            )
        }

        // Event tipi kontrolü
        const validEventTypes = ["initiated", "completed", "abandoned", "order_initiated"]
        if (!validEventTypes.includes(event_type)) {
            return NextResponse.json(
                { error: "Geçersiz event_type" },
                { status: 400 }
            )
        }

        // Supabase credentials kontrolü
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            console.log("[Event]", { event_type, tenant_id, cart_data })
            return NextResponse.json({ success: true, logged: true })
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

        // Event kaydet
        const { error } = await supabase
            .from("order_events")
            .insert({
                tenant_id,
                event_type: event_type === "order_initiated" ? "initiated" : event_type,
                cart_data,
                session_id: session_id || null,
            })

        if (error) {
            console.error("Event insert error:", error)
            return NextResponse.json(
                { error: "Event kaydedilemedi" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Events API error:", error)
        return NextResponse.json(
            { error: "Beklenmeyen hata" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: "Supabase yapılandırılmamış" },
                { status: 500 }
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

        // Auth kontrolü
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json(
                { error: "Yetkilendirme gerekli" },
                { status: 401 }
            )
        }

        // URL parametreleri
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "50")
        const eventType = searchParams.get("event_type")

        // Event'ları çek (RLS tenant_id ile filtreler)
        let query = supabase
            .from("order_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit)

        if (eventType) {
            query = query.eq("event_type", eventType)
        }

        const { data, error } = await query

        if (error) {
            console.error("Events fetch error:", error)
            return NextResponse.json(
                { error: "Event'lar alınamadı" },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error("Events API error:", error)
        return NextResponse.json(
            { error: "Beklenmeyen hata" },
            { status: 500 }
        )
    }
}

