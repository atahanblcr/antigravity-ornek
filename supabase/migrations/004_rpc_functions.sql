-- Reference.md Bölüm 3.4 - Fasetli Arama için RPC Fonksiyonu
-- Belirli bir tenant için JSONB attribute değerlerini döndürür

CREATE OR REPLACE FUNCTION public.get_product_facets(
    p_tenant_id uuid,
    p_attribute_key text
)
RETURNS TABLE(value text, count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        attributes ->> p_attribute_key AS value,
        COUNT(*) AS count
    FROM public.products
    WHERE 
        tenant_id = p_tenant_id
        AND is_active = true
        AND deleted_at IS NULL
        AND attributes ? p_attribute_key
    GROUP BY attributes ->> p_attribute_key
    ORDER BY count DESC, value ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant izinler
GRANT EXECUTE ON FUNCTION public.get_product_facets TO authenticated, anon;


-- Reference.md Bölüm 8.2 - GDPR Hard Delete
-- Belirli bir tenant'ın tüm verilerini kalıcı olarak siler
CREATE OR REPLACE FUNCTION public.hard_delete_tenant(p_tenant_id uuid)
RETURNS void AS $$
BEGIN
    -- Sıralı silme (foreign key bağımlılıkları)
    DELETE FROM public.order_events WHERE tenant_id = p_tenant_id;
    DELETE FROM public.products WHERE tenant_id = p_tenant_id;
    DELETE FROM public.categories WHERE tenant_id = p_tenant_id;
    DELETE FROM public.profiles WHERE tenant_id = p_tenant_id;
    DELETE FROM public.tenants WHERE id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sadece service role kullanabilir
REVOKE EXECUTE ON FUNCTION public.hard_delete_tenant FROM authenticated, anon, public;
