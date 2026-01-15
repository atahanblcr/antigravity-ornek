-- Kategori RLS Politikalarını Tamamen Yeniden Yaz
-- Sorun: SELECT politikası is_active=true gerektiriyor, bu yüzden soft delete çalışmıyor

-- TÜM ESKİ POLİTİKALARI KALDIR
DROP POLICY IF EXISTS "Herkes aktif kategorileri görebilir" ON public.categories;
DROP POLICY IF EXISTS "Kiracı kategori ekleyebilir" ON public.categories;
DROP POLICY IF EXISTS "Kiracı kategori güncelleyebilir" ON public.categories;
DROP POLICY IF EXISTS "Kiracı kategori silebilir" ON public.categories;

-- YENİ POLİTİKALAR

-- 1. SELECT: Anonim kullanıcılar sadece aktif kategorileri görebilir
CREATE POLICY "Anonim kullanıcılar aktif kategorileri görebilir"
ON public.categories
FOR SELECT
TO anon
USING (is_active = true AND deleted_at IS NULL);

-- 2. SELECT: Authenticated kullanıcılar kendi tenant'larının TÜM kategorilerini görebilir (aktif/pasif/silinmiş)
CREATE POLICY "Kiracı kendi kategorilerini görebilir"
ON public.categories
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);

-- 3. INSERT: Kiracı kategori ekleyebilir
CREATE POLICY "Kiracı kategori ekleyebilir"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);

-- 4. UPDATE: Kiracı kendi kategorilerini güncelleyebilir (WITH CHECK yok!)
CREATE POLICY "Kiracı kategori güncelleyebilir"
ON public.categories
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);

-- 5. DELETE: Kiracı kendi kategorilerini silebilir (hard delete için)
CREATE POLICY "Kiracı kategori silebilir"
ON public.categories
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);
