-- Düşer mevcut politika
DROP POLICY IF EXISTS "Kiracı ürün ekleyebilir" ON public.products;

-- Yeni politika: Profil tablosundan kontrol et
CREATE POLICY "Kiracı ürün ekleyebilir"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id 
        FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);
