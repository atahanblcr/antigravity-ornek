"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    Package,
    Loader2
} from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { useDeleteProduct } from "@/hooks/use-mutations"
import { createBrowserClient } from "@supabase/ssr"
import { PageSkeleton } from "@/components/ui/skeleton"

/**
 * Ürün Yönetimi Sayfası
 * Reference.md - Dashboard CRUD işlemleri, Real Data Integration
 */
export default function ProductsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [tenantId, setTenantId] = React.useState<string | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

    const deleteProduct = useDeleteProduct()

    // Tenant ID'yi al
    React.useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) return

        const supabase = createBrowserClient(url, key)

        async function getTenantId() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id) {
                setTenantId(user.app_metadata.tenant_id || user.user_metadata.tenant_id)
            } else {
                // Fallback: profil tablosundan çek (gerekirse)
                // Şimdilik demo/auth flow tam olmadığı için boş gelebilir
            }
        }

        getTenantId()
    }, [])

    const { data: products, isLoading } = useProducts(tenantId || "", undefined)

    const filteredProducts = products?.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const handleEdit = (productId: string) => {
        router.push(`/dashboard/products/${productId}`)
    }

    const handleDeleteClick = (productId: string) => {
        setDeleteConfirmId(productId)
    }

    const handleDeleteConfirm = () => {
        if (deleteConfirmId) {
            deleteProduct.mutate(deleteConfirmId)
            setDeleteConfirmId(null)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null)
    }

    if (isLoading && !products) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Ürünler</h1>
                    <p className="text-muted-foreground">
                        Toplam {filteredProducts.length} ürün
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Ürün
                    </Link>
                </Button>
            </div>

            {/* Arama */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Silme Onay Dialogu */}
            {deleteConfirmId && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium">Ürünü silmek istediğinize emin misiniz?</p>
                                <p className="text-sm text-muted-foreground">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteCancel}
                                    disabled={deleteProduct.isPending}
                                >
                                    İptal
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteProduct.isPending}
                                >
                                    {deleteProduct.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Siliniyor...
                                        </>
                                    ) : (
                                        "Evet, Sil"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ürün Listesi */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Ürün Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="pb-3 font-medium">Ürün</th>
                                    <th className="pb-3 font-medium text-right">Fiyat</th>
                                    <th className="pb-3 font-medium text-center">Durum</th>
                                    <th className="pb-3 font-medium text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="text-sm">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{product.name}</span>
                                                    {product.sku && (
                                                        <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right font-medium">
                                            {product.base_price.toLocaleString("tr-TR")} ₺
                                        </td>
                                        <td className="py-4 text-center">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {product.is_active ? "Aktif" : "Pasif"}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(product.id)}
                                                    title="Düzenle"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteClick(product.id)}
                                                    title="Sil"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!isLoading && filteredProducts.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                {tenantId ? "Ürün bulunamadı veya henüz eklenmedi." : "Ürünleri görmek için giriş yapmalısınız."}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
