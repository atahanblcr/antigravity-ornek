import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    FolderOpen,
    ShoppingCart,
    Settings,
    Store,
    LogOut,
    Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
    children: React.ReactNode
}

const NAV_ITEMS = [
    { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "Ürünler", icon: Package },
    { href: "/dashboard/categories", label: "Kategoriler", icon: FolderOpen },
    { href: "/dashboard/orders", label: "Siparişler", icon: ShoppingCart },
    { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
]

/**
 * Dashboard Layout
 * Kiracı yönetim paneli için layout
 * Mobil: Hamburger menü (Sheet)
 * Masaüstü: Sabit sidebar
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    // TODO: Auth kontrolü
    // const session = await getSession()
    // if (!session) redirect("/login")

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobil Header */}
            <header className="sticky top-0 z-50 md:hidden bg-background border-b">
                <div className="flex items-center justify-between px-4 h-14">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <MobileNav />
                        </SheetContent>
                    </Sheet>

                    <span className="font-semibold">Dijital Vitrin</span>

                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/demo" target="_blank">
                            <Store className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                    <DesktopSidebar />
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:pl-64">
                    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

function DesktopSidebar() {
    return (
        <div className="flex flex-col h-full bg-background border-r">
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b">
                <Store className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-lg">Dijital Vitrin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t">
                <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                </Button>
            </div>
        </div>
    )
}

function MobileNav() {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center h-14 px-4 border-b">
                <Store className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold">Dijital Vitrin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t">
                <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                </Button>
            </div>
        </div>
    )
}
