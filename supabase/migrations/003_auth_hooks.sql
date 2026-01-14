-- Reference.md Bölüm 2.3 - Kullanıcı Senkronizasyonu
-- auth.users -> public.profiles otomatik senkronizasyon

-- Yeni kullanıcı oluşturulduğunda profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        user_id,
        tenant_id,
        full_name,
        role
    )
    VALUES (
        gen_random_uuid(),
        NEW.id,
        -- İlk kayıtta tenant_id raw_user_meta_data'dan alınır
        (NEW.raw_user_meta_data ->> 'tenant_id')::uuid,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'owner')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users INSERT sonrası
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- Reference.md Bölüm 2.1.1 - JWT Custom Claims
-- Login sırasında tenant_id'yi JWT'ye ekle
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
    claims jsonb;
    user_tenant_id uuid;
    user_role text;
BEGIN
    -- Mevcut claims'i al
    claims := event -> 'claims';
    
    -- Kullanıcının tenant_id ve role'ünü profiles'dan çek
    SELECT tenant_id, role INTO user_tenant_id, user_role
    FROM public.profiles
    WHERE user_id = (event ->> 'user_id')::uuid
    LIMIT 1;
    
    -- Claims'e ekle
    IF user_tenant_id IS NOT NULL THEN
        claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id::text));
    END IF;
    
    IF user_role IS NOT NULL THEN
        claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
    END IF;
    
    -- Güncellenmiş event'i döndür
    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant gerekli izinler
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
