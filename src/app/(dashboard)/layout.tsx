import * as React from "react"
import Link from "next/link"
import { Menu, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DesktopSidebar } from "@/components/dashboard/desktop-sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"

interface DashboardLayoutProps {
    children: React.ReactNode
}

/**
 * Dashboard Layout
 * Kiracı yönetim paneli için layout
 * Mobil: Hamburger menü (Sheet)
 * Masaüstü: Sabit sidebar
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    // TODO: Auth kontrolü middleware'de yapılıyor.

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
