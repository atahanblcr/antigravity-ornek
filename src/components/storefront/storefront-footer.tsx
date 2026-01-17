"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react"

interface StorefrontFooterProps {
    tenantName: string
    whatsappNumber?: string
    description?: string
}

export function StorefrontFooter({ tenantName, whatsappNumber, description }: StorefrontFooterProps) {
    return (
        <footer className="relative bg-slate-900 text-slate-200 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="container px-4 py-16 relative z-10">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Brand Info */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-3xl font-black tracking-tighter text-white">
                            {tenantName}
                        </h2>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            {description || "En seçkin ürünleri güvenle satın alabileceğiniz dijital vitrinimiz."}
                        </p>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white">Hızlı Erişim</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">Ana Sayfa</Link>
                            </li>
                            <li>
                                <Link href="#products" className="text-slate-400 hover:text-white transition-colors">Ürünler</Link>
                            </li>
                            <li>
                                <Link href="#services" className="text-slate-400 hover:text-white transition-colors">Hizmetler</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">İletişim</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white">İletişim</h3>
                        <ul className="space-y-4">
                            {whatsappNumber && (
                                <li className="flex items-start gap-3 text-slate-400 group">
                                    <Phone className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                    <span>{whatsappNumber}</span>
                                </li>
                            )}
                            <li className="flex items-start gap-3 text-slate-400 group">
                                <Mail className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                <span>iletisim@{tenantName.toLowerCase().replace(/\s+/g, '')}.com</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400 group">
                                <MapPin className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                <span>İstanbul, Türkiye</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {tenantName}. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    )
}
