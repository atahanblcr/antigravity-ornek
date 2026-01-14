"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Save } from "lucide-react"

/**
 * Mağaza Ayarları Sayfası
 */
export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Mağaza Ayarları</h1>
                <p className="text-muted-foreground">
                    Mağaza bilgilerinizi ve tercihlerinizi yönetin
                </p>
            </div>

            {/* Genel Bilgiler */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Genel Bilgiler
                    </CardTitle>
                    <CardDescription>
                        Mağazanızın temel bilgilerini güncelleyin
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Mağaza Adı</Label>
                            <Input id="storeName" defaultValue="Demo Mağaza" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="storeSlug">URL Slug</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                                    vitrin.com/
                                </span>
                                <Input
                                    id="storeSlug"
                                    defaultValue="demo"
                                    className="rounded-l-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Input
                            id="description"
                            defaultValue="Kaliteli ürünler, uygun fiyatlar"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Numarası</Label>
                            <Input
                                id="whatsapp"
                                type="tel"
                                defaultValue="+905551234567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Konum</Label>
                            <Input id="location" defaultValue="İstanbul, Türkiye" />
                        </div>
                    </div>

                    <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                    </Button>
                </CardContent>
            </Card>

            {/* Görünüm Ayarları */}
            <Card>
                <CardHeader>
                    <CardTitle>Görünüm Ayarları</CardTitle>
                    <CardDescription>
                        Vitrin temasını ve görünümünü özelleştirin
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Ana Renk</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    defaultValue="#000000"
                                    className="w-12 h-10 p-1"
                                />
                                <Input defaultValue="#000000" className="flex-1" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo</Label>
                            <Input id="logo" type="file" accept="image/*" />
                        </div>
                    </div>

                    <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
