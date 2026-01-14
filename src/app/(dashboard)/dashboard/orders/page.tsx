import * as React from "react"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Clock, Package } from "lucide-react"

interface OrderEvent {
    id: string
    event_type: string
    cart_data: {
        items?: Array<{ name: string; quantity: number; price: number }>
        total?: number
    } | null
    session_id?: string
    created_at: string
}

/**
 * Siparişler Sayfası (Server Component)
 * Reference.md Bölüm 6.2 - order_events tablosu
 */
export default async function OrdersPage() {
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

    // Siparişleri çek (RLS tenant_id ile filtreler)
    const { data: orders, error } = await supabase
        .from("order_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

    // İstatistikler
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = orders?.filter(o => new Date(o.created_at) >= today) || []
    const initiatedOrders = orders?.filter(o => o.event_type === "initiated") || []

    // Toplam gelir tahmini
    const totalRevenue = initiatedOrders.reduce((sum, o) => {
        const cartData = o.cart_data as OrderEvent["cart_data"]
        return sum + (cartData?.total || 0)
    }, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Siparişler</h1>
                <p className="text-muted-foreground">
                    WhatsApp üzerinden gelen sipariş taleplerini takip edin
                </p>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Bugün
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayOrders.length}</div>
                        <p className="text-xs text-muted-foreground">sipariş talebi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initiatedOrders.length}</div>
                        <p className="text-xs text-muted-foreground">sipariş talebi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tahmini Gelir
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalRevenue.toLocaleString("tr-TR")} ₺
                        </div>
                        <p className="text-xs text-muted-foreground">sepet toplamı</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sipariş Listesi */}
            <Card>
                <CardHeader>
                    <CardTitle>Son Siparişler</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders && orders.length > 0 ? (
                        <div className="divide-y">
                            {orders.map((order) => {
                                const cartData = order.cart_data as OrderEvent["cart_data"]
                                return (
                                    <div
                                        key={order.id}
                                        className="py-4 flex items-start gap-4"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <ShoppingCart className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-medium">
                                                    {order.event_type === "initiated"
                                                        ? "WhatsApp Siparişi"
                                                        : order.event_type}
                                                </p>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleString("tr-TR", {
                                                        dateStyle: "short",
                                                        timeStyle: "short",
                                                    })}
                                                </span>
                                            </div>
                                            {cartData?.items && cartData.items.length > 0 && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {cartData.items.map(i => `${i.name} (${i.quantity}x)`).join(", ")}
                                                </p>
                                            )}
                                            {cartData?.total && (
                                                <p className="text-sm font-medium mt-1">
                                                    Toplam: {cartData.total.toLocaleString("tr-TR")} ₺
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Henüz sipariş talebi yok</p>
                            <p className="text-sm mt-1">
                                Müşterileriniz WhatsApp üzerinden sipariş verdiğinde burada görünecek
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
