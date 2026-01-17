-- Eksik sütunları tenants tablosuna ekle
-- Description ve Location sütunları formda kullanılıyor ancak tabloda yoktu

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Yorumlar
COMMENT ON COLUMN public.tenants.description IS 'Mağaza hakkında kısa açıklama';
COMMENT ON COLUMN public.tenants.location IS 'Mağaza konumu (Şehir, Ülke)';
