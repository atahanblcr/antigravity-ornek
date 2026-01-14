-- Dijital Vitrin SaaS v3.0 - Kayıt için RLS Politikası
-- Bu migration, anon kullanıcıların register sırasında tenant oluşturabilmesini sağlar

-- Anon kullanıcılar tenant oluşturabilir (registration için)
CREATE POLICY "Anon kullanıcılar tenant oluşturabilir"
ON public.tenants
FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================
-- CATEGORIES INSERT POLİTİKASI
-- ============================================

-- Authenticated kullanıcılar kendi tenant'larına kategori ekleyebilir
CREATE POLICY "Kullanıcı kendi tenant kategorisi ekleyebilir"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR tenant_id IN (
        SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================
-- PRODUCTS INSERT POLİTİKASI
-- ============================================

-- Authenticated kullanıcılar kendi tenant'larına ürün ekleyebilir
CREATE POLICY "Kullanıcı kendi tenant ürünü ekleyebilir"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR tenant_id IN (
        SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================
-- PROFILES INSERT POLİTİKASI
-- ============================================

-- Auth hook yeni kullanıcı için profil oluşturabilir
CREATE POLICY "Auth hook profil oluşturabilir"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

