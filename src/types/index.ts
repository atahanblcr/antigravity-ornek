/**
 * Temel Tip Tanımları
 * Reference.md - TypeScript strict mode, any yasak
 */

// Tenant (Kiracı)
export interface Tenant {
    id: string
    name: string
    slug: string
    whatsapp_number: string
    logo_url?: string
    settings: TenantSettings
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface TenantSettings {
    primary_color?: string
    location?: string
    description?: string
    social_links?: Record<string, string>
}

// Profil
export interface Profile {
    id: string
    user_id: string
    tenant_id: string
    full_name: string
    avatar_url?: string
    role: "owner" | "admin" | "staff"
    created_at: string
    updated_at: string
}

// Kategori
export interface Category {
    id: string
    tenant_id: string
    name: string
    slug: string
    description?: string
    image_url?: string
    parent_id?: string
    sort_order: number
    is_active: boolean
    deleted_at?: string
    created_at: string
    updated_at: string
}

// Ürün
export interface Product {
    id: string
    tenant_id: string
    category_id?: string
    name: string
    description?: string
    base_price: number
    sale_price?: number
    sku?: string
    image_url?: string
    images?: string[]
    attributes: Record<string, string>
    is_active: boolean
    deleted_at?: string
    created_at: string
    updated_at: string
}

// Sipariş Olayı
export interface OrderEvent {
    id: string
    tenant_id: string
    event_type: "order_initiated" | "order_completed" | "order_cancelled"
    payload: Record<string, unknown>
    created_at: string
}

// Form Konfigürasyonu (Dinamik Form Motoru)
export interface FormFieldConfig {
    name: string
    type: "text" | "number" | "email" | "tel" | "select" | "textarea" | "checkbox"
    label: string
    placeholder?: string
    required?: boolean
    options?: { value: string; label: string }[]
    validation?: {
        min?: number
        max?: number
        minLength?: number
        maxLength?: number
        pattern?: string
    }
}

export interface FormConfig {
    id: string
    tenant_id: string
    name: string
    fields: FormFieldConfig[]
    is_active: boolean
}

// API Response
export interface ApiResponse<T> {
    data?: T
    error?: string
    success: boolean
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}
