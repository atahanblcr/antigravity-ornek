"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Package, ChevronLeft, ChevronRight, Share2, Heart, Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"


import { WhatsAppOrderButton } from "@/components/shared/whatsapp-order-button"
import { ProductCard } from "@/components/storefront/product-card"
import type { Product, Tenant } from "@/types"

interface ProductDetailClientProps {
    product: Product & {
        categories?: { name: string; slug: string } | { name: string; slug: string }[] | null
    }
    tenant: Tenant
    relatedProducts: Pick<Product, "id" | "name" | "slug" | "base_price" | "sale_price" | "image_url" | "images" | "attributes">[]
}

/**
 * Ürün Detay Client Bileşeni
 * Premium Vitrin Tasarımı
 */
export function ProductDetailClient({
    product,
    tenant,
    relatedProducts,
}: ProductDetailClientProps) {
    const [selectedImage, setSelectedImage] = React.useState(0)
    const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({})
    const [quantity, setQuantity] = React.useState(1)

    // Ürün görselleri - images array veya tek image_url
    const images: string[] = React.useMemo(() => {
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images
        }
        if (product.image_url) {
            return [product.image_url]
        }
        return []
    }, [product.images, product.image_url])

    // Fiyat hesaplama
    const currentPrice = product.sale_price ?? product.base_price
    const hasDiscount = product.sale_price && product.sale_price < product.base_price
    const discountPercent = hasDiscount
        ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
        : 0

    // Attribute'ları obje olarak parse et
    const attributes = product.attributes as Record<string, string | string[]> | null

    const handleAttributeChange = (key: string, value: string) => {
        setSelectedAttributes((prev) => ({ ...prev, [key]: value }))
    }

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="relative flex-1 w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-20">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl mb-20" />
            </div>

            <main className="container relative z-10 px-4 py-8 md:py-12">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                    {/* Görsel Galeri - Left Side */}
                    <div className="space-y-6">
                        {/* Ana Görsel */}
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl shadow-black/5 group border border-white/40">
                            {images.length > 0 ? (
                                <>
                                    <Image
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />

                                    {/* İndirim Rozeti */}
                                    {hasDiscount && (
                                        <div className="absolute top-6 left-6 z-20 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                                            %{discountPercent} İNDİRİM
                                        </div>
                                    )}

                                    {/* Galeri Navigasyonu */}
                                    {images.length > 1 && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={prevImage}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={nextImage}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>

                                            {/* Sayfa Göstergesi */}
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/20 backdrop-blur-sm">
                                                {images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedImage(idx)}
                                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === selectedImage
                                                            ? "bg-white scale-110"
                                                            : "bg-white/40 hover:bg-white/60"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-slate-50">
                                    <Package className="h-20 w-20 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail'ler */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 px-2 snap-x">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300 snap-center ${idx === selectedImage
                                            ? "ring-2 ring-primary ring-offset-2 shadow-lg scale-105"
                                            : "opacity-70 hover:opacity-100 hover:scale-105"
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} - ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ürün Bilgileri - Right Side */}
                    <div className="flex flex-col h-full">
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/50 shadow-xl shadow-black/5 space-y-8 relative overflow-hidden">
                            {/* Decorative Gradient Top */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />

                            <div>
                                {/* Kategori & Actions */}
                                <div className="flex items-center justify-between mb-4">
                                    {product.categories && (
                                        <Link
                                            href={`/${tenant.slug}/${Array.isArray(product.categories) ? product.categories[0]?.slug : product.categories.slug}`}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                        >
                                            {Array.isArray(product.categories) ? product.categories[0]?.name : product.categories.name}
                                        </Link>
                                    )}
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                            <Heart className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Başlık */}
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                    {product.name}
                                </h1>
                            </div>

                            {/* Fiyat Alanı */}
                            <div className="flex items-end gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-border/50">
                                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    {currentPrice.toLocaleString("tr-TR")}<span className="text-2xl text-primary/80 ml-1">₺</span>
                                </span>
                                {hasDiscount && (
                                    <div className="flex flex-col mb-1.5">
                                        <span className="text-lg text-muted-foreground/60 line-through decoration-2 decoration-rose-500/40">
                                            {product.base_price.toLocaleString("tr-TR")} ₺
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Açıklama */}
                            {product.description && (
                                <div className="prose prose-slate max-w-none text-muted-foreground">
                                    <p className="leading-relaxed text-lg">{product.description}</p>
                                </div>
                            )}

                            {/* Dinamik Özellikler (JSONB) */}
                            {attributes && Object.keys(attributes).length > 0 && (
                                <div className="space-y-6 pt-6 border-t border-border/50">
                                    {Object.entries(attributes).map(([key, value]) => (
                                        <div key={key} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                                                    {key}
                                                </label>
                                                {selectedAttributes[key] && (
                                                    <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                                                        Seçildi: {selectedAttributes[key]}
                                                    </span>
                                                )}
                                            </div>

                                            {Array.isArray(value) ? (
                                                <div className="flex flex-wrap gap-3">
                                                    {value.map((option) => (
                                                        <button
                                                            key={option}
                                                            onClick={() => handleAttributeChange(key, option)}
                                                            className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${selectedAttributes[key] === option
                                                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                                : "border-transparent bg-slate-100/80 text-foreground/80 hover:bg-slate-200"
                                                                }`}
                                                        >
                                                            {selectedAttributes[key] === option && (
                                                                <div className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                                                    <Check className="h-2.5 w-2.5" />
                                                                </div>
                                                            )}
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2 rounded-xl bg-slate-50 border border-border/50 text-sm font-medium">
                                                    {value}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Adet Seçimi ve Sipariş */}
                            <div className="pt-6 mt-auto space-y-4">
                                <WhatsAppOrderButton
                                    tenantId={tenant.id}
                                    phoneNumber={tenant.whatsapp_number}
                                    storeName={tenant.name}
                                    productName={product.name}
                                    productPrice={currentPrice}
                                    selectedAttributes={selectedAttributes}
                                    className="w-full text-lg h-14 rounded-2xl shadow-xl shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] transition-all duration-300"
                                />
                                <p className="text-xs text-center text-muted-foreground">
                                    Siparişiniz WhatsApp üzerinden işletmeye iletilecektir.
                                </p>
                            </div>
                        </div>

                        {/* SKU - Alt Bilgi */}
                        {product.sku && (
                            <div className="mt-4 text-center">
                                <span className="text-xs text-muted-foreground/50 font-mono tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                    SKU: {product.sku}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* İlgili Ürünler */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20 md:mt-32">
                        <div className="flex items-center gap-4 mb-8 md:mb-12">
                            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-blue-600" />
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Benzer Ürünler</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map((related) => (
                                <div key={related.id} className="h-[400px]">
                                    <ProductCard
                                        product={related as unknown as Product}
                                        tenantSlug={tenant.slug}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
