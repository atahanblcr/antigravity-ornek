"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Store, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "./nav-items"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
// import { SheetClose } from "@/components/ui/sheet" // Optional: Close sheet on click

export function MobileNav() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center h-14 px-4 border-b">
                <Store className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold">Dijital Vitrin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    size="sm"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                </Button>
            </div>
        </div>
    )
}
