import * as React from "react"
import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Package,
    FolderOpen,
    ShoppingCart,
    TrendingUp,
    Eye,
    Plus,
    ExternalLink,
} from "lucide-react"

interface DashboardStats {
    totalProducts: number
    totalCategories: number
    todayOrders: number
    weekOrders: number
}

async function getDashboardStats(): Promise<DashboardStats | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return null
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

    // Products sayısı (RLS tenant_id ile filtreler)
    const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .is("deleted_at", null)

    // Categories sayısı
    const { count: categoriesCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .is("deleted_at", null)

    // Bugünkü siparişler
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayOrdersCount } = await supabase
        .from("order_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "initiated")
        .gte("created_at", today.toISOString())

    // Bu haftaki siparişler
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: weekOrdersCount } = await supabase
        .from("order_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "initiated")
        .gte("created_at", weekAgo.toISOString())

    return {
        totalProducts: productsCount || 0,
        totalCategories: categoriesCount || 0,
        todayOrders: todayOrdersCount || 0,
        weekOrders: weekOrdersCount || 0,
    }
}

async function getRecentOrders() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return []
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

    const { data } = await supabase
        .from("order_events")
        .select("*")
        .eq("event_type", "initiated")
        .order("created_at", { ascending: false })
        .limit(5)

    return data || []
}

async function getTenantSlug() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return "demo"
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

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return "demo"

    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", user.user.id)
        .single()

    if (!profile) return "demo"

    const { data: tenant } = await supabase
        .from("tenants")
        .select("slug")
        .eq("id", profile.tenant_id)
        .single()

    return tenant?.slug || "demo"
}

/**
 * Dashboard Ana Sayfası
 * Gerçek veritabanı verileriyle istatistikler
 */
export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const recentOrders = await getRecentOrders()
    const tenantSlug = await getTenantSlug()

    const STATS = [
        {
            label: "Toplam Ürün",
            value: stats?.totalProducts.toString() || "0",
            icon: Package,
            trend: null,
        },
        {
            label: "Kategoriler",
            value: stats?.totalCategories.toString() || "0",
            icon: FolderOpen,
            trend: null,
        },
        {
            label: "Bugünkü Sipariş",
            value: stats?.todayOrders.toString() || "0",
            icon: ShoppingCart,
            trend: stats?.weekOrders ? `${stats.weekOrders} bu hafta` : null,
        },
        {
            label: "Vitrin Bağlantısı",
            value: tenantSlug,
            icon: Eye,
            trend: null,
            isLink: true,
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Hoş Geldiniz 👋</h1>
                    <p className="text-muted-foreground">
                        Mağazanızın genel durumunu buradan takip edebilirsiniz.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Ürün
                    </Link>
                </Button>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {stat.isLink ? (
                                <Link
                                    href={`/${stat.value}`}
                                    target="_blank"
                                    className="text-xl font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    /{stat.value}
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            ) : (
                                <div className="text-2xl font-bold">{stat.value}</div>
                            )}
                            {stat.trend && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {stat.trend}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Hızlı Erişim ve Son Siparişler */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/dashboard/products/new">
                                <Package className="h-4 w-4 mr-2" />
                                Yeni Ürün Ekle
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/dashboard/categories/new">
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Yeni Kategori Oluştur
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href={`/${tenantSlug}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Vitrini Görüntüle
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Son Siparişler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order: { id: string; created_at: string; cart_data?: { total?: number } }) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString("tr-TR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                        <span className="font-medium">
                                            {order.cart_data?.total
                                                ? `${order.cart_data.total.toLocaleString("tr-TR")} ₺`
                                                : "WhatsApp Sipariş"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Henüz sipariş yok
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
