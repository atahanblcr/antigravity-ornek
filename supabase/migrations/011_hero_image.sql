-- Hero Görseli için Tenant Tablosuna Sütun Ekleme
-- Önerilen format: WebP, 1920x1080 (16:9 aspect ratio)
-- Mobil için otomatik ölçeklenecek

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Index for performance (optional)
COMMENT ON COLUMN public.tenants.hero_image_url IS 'Hero banner image URL. Recommended: WebP format, 1920x1080px (16:9 ratio)';
