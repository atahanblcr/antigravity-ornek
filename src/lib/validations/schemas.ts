import { z } from 'zod'

/**
 * Temel doğrulama şemaları
 * Reference.md Bölüm 5 - Dinamik Form Motoru için temel
 */

// Ürün şeması
export const productSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    name: z.string().min(1, 'Ürün adı zorunludur'),
    base_price: z.number().min(0, 'Fiyat negatif olamaz'),
    attributes: z.record(z.string(), z.unknown()).default({}),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime().optional(),
})

export type Product = z.infer<typeof productSchema>

// Kategori şeması
export const categorySchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    name: z.string().min(1, 'Kategori adı zorunludur'),
    slug: z.string().min(1),
    parent_id: z.string().uuid().nullable().optional(),
    sort_order: z.number().int().default(0),
})

export type Category = z.infer<typeof categorySchema>

// Kiracı (Tenant) şeması
export const tenantSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Mağaza adı zorunludur'),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
    whatsapp_number: z.string().min(10, 'Geçerli bir telefon numarası girin'),
    logo_url: z.string().url().optional(),
    is_active: z.boolean().default(true),
})

export type Tenant = z.infer<typeof tenantSchema>

// Kullanıcı profili şeması
export const profileSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    full_name: z.string().min(1).optional(),
    avatar_url: z.string().url().optional(),
    role: z.enum(['owner', 'admin', 'member']).default('member'),
})

export type Profile = z.infer<typeof profileSchema>

// Sipariş olayı şeması (analitik için)
export const orderEventSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    event_type: z.enum(['initiated', 'completed', 'abandoned']),
    cart_data: z.record(z.string(), z.unknown()),
    created_at: z.string().datetime(),
})

export type OrderEvent = z.infer<typeof orderEventSchema>
