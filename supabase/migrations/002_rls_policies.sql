-- Dijital Vitrin SaaS v3.0 - RLS Politikaları
-- Reference.md Bölüm 2.1 ve 2.2 gereksinimlerine uygun
-- JWT Custom Claims tabanlı tenant izolasyonu

-- ============================================
-- RLS'i Etkinleştir
-- ============================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TENANTS POLİTİKALARI
-- ============================================

-- Herkes aktif tenant'ları görebilir (vitrin için)
CREATE POLICY "Herkes aktif kiracıları görebilir"
ON public.tenants
FOR SELECT
TO anon, authenticated
USING (is_active = true AND deleted_at IS NULL);

-- Sadece kiracı sahibi düzenleyebilir
CREATE POLICY "Kiracı sahibi düzenleyebilir"
ON public.tenants
FOR UPDATE
TO authenticated
USING (
    id = (auth.jwt() ->> 'tenant_id')::uuid
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND tenant_id = tenants.id 
        AND role = 'owner'
    )
);

-- ============================================
-- PROFILES POLİTİKALARI
-- ============================================

-- Kullanıcı kendi profillerini görebilir
CREATE POLICY "Kullanıcı kendi profilini görebilir"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Aynı tenant'taki profiller görülebilir (ekip yönetimi)
CREATE POLICY "Kiracı üyeleri birbirini görebilir"
ON public.profiles
FOR SELECT
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Kullanıcı kendi profilini güncelleyebilir
CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- CATEGORIES POLİTİKALARI
-- ============================================

-- Herkes aktif kategorileri görebilir (vitrin için)
CREATE POLICY "Herkes aktif kategorileri görebilir"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (is_active = true AND deleted_at IS NULL);

-- Kiracı kendi kategorilerini ekleyebilir
CREATE POLICY "Kiracı kategori ekleyebilir"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Kiracı kendi kategorilerini güncelleyebilir
CREATE POLICY "Kiracı kategori güncelleyebilir"
ON public.categories
FOR UPDATE
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Kiracı kendi kategorilerini silebilir
CREATE POLICY "Kiracı kategori silebilir"
ON public.categories
FOR DELETE
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================
-- PRODUCTS POLİTİKALARI
-- ============================================

-- Herkes aktif ürünleri görebilir (vitrin için)
CREATE POLICY "Herkes aktif ürünleri görebilir"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true AND deleted_at IS NULL);

-- Kiracı kendi ürünlerini ekleyebilir
CREATE POLICY "Kiracı ürün ekleyebilir"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Kiracı kendi ürünlerini güncelleyebilir
CREATE POLICY "Kiracı ürün güncelleyebilir"
ON public.products
FOR UPDATE
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Kiracı kendi ürünlerini silebilir
CREATE POLICY "Kiracı ürün silebilir"
ON public.products
FOR DELETE
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================
-- ORDER_EVENTS POLİTİKALARI
-- ============================================

-- Herkes kendi oturumundan sipariş olayı ekleyebilir
CREATE POLICY "Herkes sipariş olayı ekleyebilir"
ON public.order_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Kiracı kendi sipariş olaylarını görebilir
CREATE POLICY "Kiracı sipariş olaylarını görebilir"
ON public.order_events
FOR SELECT
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
