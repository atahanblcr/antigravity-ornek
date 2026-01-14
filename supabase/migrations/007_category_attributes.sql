-- Dijital Vitrin SaaS v3.0 - Kategori Özellik Şeması
-- Her kategori kendi özelliklerini tanımlayabilir (Beden, Renk, Marka vb.)

-- Categories tablosuna attribute_schema alanı ekle
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS attribute_schema JSONB DEFAULT '[]'::jsonb;

-- Örnek kullanım:
-- attribute_schema: [
--   {"key": "Beden", "type": "select", "options": ["XS", "S", "M", "L", "XL"], "required": true},
--   {"key": "Renk", "type": "text", "required": false},
--   {"key": "Ağırlık (kg)", "type": "number", "required": false}
-- ]

COMMENT ON COLUMN public.categories.attribute_schema IS 'Kategoriye özel ürün özellikleri şeması. Her özellik key, type (text/select/number) ve options (select için) içerir.';
