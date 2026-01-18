import {
    LayoutDashboard,
    Package,
    FolderOpen,
    ShoppingCart,
    Settings,
} from "lucide-react"

export const NAV_ITEMS = [
    { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "Ürünler", icon: Package },
    { href: "/dashboard/categories", label: "Kategoriler", icon: FolderOpen },
    { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
]
