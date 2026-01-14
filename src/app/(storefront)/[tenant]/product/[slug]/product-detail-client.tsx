"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Package, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AddToCartButton } from "@/components/storefront/add-to-cart-button"
import { WhatsAppOrderButton } from "@/components/shared/whatsapp-order-button"
import type { Product, Tenant } from "@/types"

interface ProductDetailClientProps {
    product: Product & {
        categories?: { name: string; slug: string } | null
    }
    tenant: Tenant
    relatedProducts: Pick<Product, "id" | "name" | "slug" | "base_price" | "sale_price" | "image_url">[]
}

/**
 * Ürün Detay Client Bileşeni
 * İnteraktif özellikler: Galeri, attribute seçimi, sepete ekleme
 */
export function ProductDetailClient({
    product,
    tenant,
    relatedProducts,
}: ProductDetailClientProps) {
    const [selectedImage, setSelectedImage] = React.useState(0)
    const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({})

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
        <>
            <main className="container px-4 py-6">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Görsel Galeri */}
                    <div className="space-y-4">
                        {/* Ana Görsel */}
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                            {images.length > 0 ? (
                                <>
                                    <Image
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />
                                    {/* Galeri Navigasyonu */}
                                    {images.length > 1 && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-80"
                                                onClick={prevImage}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-80"
                                                onClick={nextImage}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            {/* Sayfa Göstergesi */}
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedImage(idx)}
                                                        className={`w-2 h-2 rounded-full transition-colors ${idx === selectedImage
                                                                ? "bg-white"
                                                                : "bg-white/50"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Package className="h-16 w-16 text-muted-foreground/50" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail'ler */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${idx === selectedImage
                                                ? "border-primary"
                                                : "border-transparent"
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} - ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="space-y-6">
                        {/* Kategori */}
                        {product.categories && (
                            <Link
                                href={`/${tenant.slug}/${product.categories.slug}`}
                                className="text-sm text-primary hover:underline"
                            >
                                {product.categories.name}
                            </Link>
                        )}

                        {/* Başlık */}
                        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

                        {/* Fiyat */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold">
                                {currentPrice.toLocaleString("tr-TR")} ₺
                            </span>
                            {hasDiscount && (
                                <span className="text-lg text-muted-foreground line-through">
                                    {product.base_price.toLocaleString("tr-TR")} ₺
                                </span>
                            )}
                        </div>

                        {/* Açıklama */}
                        {product.description && (
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Dinamik Özellikler (JSONB) */}
                        {attributes && Object.keys(attributes).length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-medium">Ürün Özellikleri</h3>
                                {Object.entries(attributes).map(([key, value]) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {key}
                                        </label>
                                        {Array.isArray(value) ? (
                                            // Birden fazla seçenek varsa
                                            <div className="flex flex-wrap gap-2">
                                                {value.map((option) => (
                                                    <Button
                                                        key={option}
                                                        variant={
                                                            selectedAttributes[key] === option
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() => handleAttributeChange(key, option)}
                                                    >
                                                        {option}
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            // Tek değer varsa sadece göster
                                            <p className="text-sm">{value}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SKU */}
                        {product.sku && (
                            <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                            </p>
                        )}

                        {/* Sepete Ekle Butonu */}
                        <div className="pt-4">
                            <AddToCartButton
                                product={product}
                                selectedAttributes={selectedAttributes}
                                className="w-full h-12 text-base"
                            />
                        </div>
                    </div>
                </div>

                {/* İlgili Ürünler */}
                {relatedProducts.length > 0 && (
                    <section className="mt-12 space-y-4">
                        <h2 className="text-xl font-semibold">Benzer Ürünler</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/${tenant.slug}/product/${related.slug}`}
                                >
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative aspect-square bg-muted">
                                            {related.image_url ? (
                                                <Image
                                                    src={related.image_url}
                                                    alt={related.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Package className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="font-medium text-sm truncate">
                                                {related.name}
                                            </h3>
                                            <p className="text-sm font-semibold mt-1">
                                                {(related.sale_price ?? related.base_price).toLocaleString("tr-TR")} ₺
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* WhatsApp Butonu */}
            <WhatsAppOrderButton
                tenantId={tenant.id}
                phoneNumber={tenant.whatsapp_number}
                storeName={tenant.name}
            />
        </>
    )
}
