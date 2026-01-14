import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Package,
    FolderOpen,
    ShoppingCart,
    TrendingUp,
    Eye,
    Plus,
} from "lucide-react"

// Demo istatistikler
const STATS = [
    { label: "Toplam Ürün", value: "124", icon: Package, trend: "+12%" },
    { label: "Kategoriler", value: "8", icon: FolderOpen, trend: null },
    { label: "Bugünkü Sipariş", value: "23", icon: ShoppingCart, trend: "+5%" },
    { label: "Vitrin Görüntüleme", value: "1.2K", icon: Eye, trend: "+18%" },
]

/**
 * Dashboard Ana Sayfası
 * İstatistikler ve hızlı erişim
 */
export default function DashboardPage() {
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
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.trend && (
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {stat.trend} bu hafta
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Hızlı Erişim */}
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
                            <Link href="/demo" target="_blank">
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
                        <div className="text-sm text-muted-foreground text-center py-8">
                            Henüz sipariş yok
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
