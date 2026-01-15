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
    FolderOpen,
} from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import { useDeleteCategory } from "@/hooks/use-mutations"
import { createBrowserClient } from "@supabase/ssr"
import { PageSkeleton } from "@/components/ui/skeleton"

/**
 * Kategori Yönetimi Sayfası
 * Reference.md - Real Data Integration
 */
export default function CategoriesPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [tenantId, setTenantId] = React.useState<string | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
    const deleteCategory = useDeleteCategory()

    React.useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) return

        const supabase = createBrowserClient(url, key)

        async function getTenantId() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id) {
                setTenantId(user.app_metadata.tenant_id || user.user_metadata.tenant_id)
            }
        }

        getTenantId()
    }, [])

    const { data: categories, isLoading } = useCategories(tenantId || "")

    const filteredCategories = categories?.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const handleEdit = (categoryId: string) => {
        router.push(`/dashboard/categories/${categoryId}`)
    }

    const handleDeleteClick = (categoryId: string) => {
        setDeleteConfirmId(categoryId)
    }

    const handleDeleteConfirm = () => {
        if (deleteConfirmId) {
            deleteCategory.mutate(deleteConfirmId)
            setDeleteConfirmId(null)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null)
    }

    if (isLoading && !categories) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Kategoriler</h1>
                    <p className="text-muted-foreground">
                        Toplam {filteredCategories.length} kategori
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/categories/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Kategori
                    </Link>
                </Button>
            </div>

            {/* Arama */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Kategori ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Kategori Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FolderOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{category.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">/{category.slug}</p>
                                </div>
                            </div>
                            <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${category.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {category.is_active ? "Aktif" : "Pasif"}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {/* Ürün sayısı join gerektirir, şimdilik statik veya backend count */}
                                    -
                                </span>
                                {deleteConfirmId === category.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-destructive">Emin misiniz?</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDeleteConfirm}
                                            disabled={deleteCategory.isPending}
                                            className="h-7 text-xs text-destructive hover:text-destructive"
                                        >
                                            Evet
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDeleteCancel}
                                            className="h-7 text-xs"
                                        >
                                            İptal
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(category.id)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => handleDeleteClick(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!isLoading && filteredCategories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    {tenantId ? "Kategori bulunamadı veya henüz eklenmedi." : "Kategorileri görmek için giriş yapmalısınız."}
                </div>
            )}
        </div>
    )
}
