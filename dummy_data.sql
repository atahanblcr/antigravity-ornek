-- ==========================================
-- DUMMY DATA GENERATOR
-- Cleans existing data and inserts realistic demo content
-- ==========================================

-- 1. Temizlik (İsteğe bağlı, mevcut veriyi siler)
-- TRUNCATE public.order_events, public.product_variants, public.products, public.categories, public.profiles, public.tenants CASCADE;

-- 2. Tenant (Mağaza) Oluşturma
-- Demo Mağaza: "Fashion Aura"
INSERT INTO public.tenants (id, name, slug, whatsapp_number, logo_url, is_active)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fashion Aura', 'fashion-aura', '905551234567', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Kategoriler
INSERT INTO public.categories (id, tenant_id, name, slug, image_url, sort_order)
VALUES
    ('c1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Yeni Sezon', 'yeni-sezon', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500', 1),
    ('c2000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kadın Giyim', 'kadin-giyim', 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500', 2),
    ('c3000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Erkek Giyim', 'erkek-giyim', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=500', 3),
    ('c4000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Aksesuarlar', 'aksesuarlar', 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=500', 4)
ON CONFLICT DO NOTHING;

-- 4. Ürünler
-- Kadın Giyim Ürünleri
INSERT INTO public.products (tenant_id, category_id, name, slug, description, base_price, sale_price, attributes, images, is_active, is_featured)
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'c2000000-0000-0000-0000-000000000002',
        'İpek Karışımlı Midi Elbise',
        'ipek-karisimli-midi-elbise',
        'Yaz ayları için mükemmel, hafif ve nefes alan kumaş yapısı. %60 İpek, %40 Pamuk.',
        1299.90,
        899.90,
        '{"Beden": ["S", "M", "L"], "Renk": ["Krem", "Siyah"]}',
        '["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600", "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600"]',
        true,
        true
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'c2000000-0000-0000-0000-000000000002',
        'Bol Kesim Blazer Ceket',
        'bol-kesim-blazer-ceket',
        'Ofis şıklığını sokağa taşıyan modern kesim ceket.',
        1850.00,
        null,
        '{"Beden": ["36", "38", "40", "42"], "Renk": ["Gri", "Lacivert"]}',
        '["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600"]',
        true,
        true
    ),
     (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'c2000000-0000-0000-0000-000000000002',
        'Yüksek Bel Mom Jean',
        'yuksek-bel-mom-jean',
        '90''lar stili, rahat kesim yüksek bel denim pantolon.',
        750.00,
        649.90,
        '{"Beden": ["26", "28", "30", "32"], "Renk": ["Mavi"]}',
        '["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600"]',
        true,
        false
    );

-- Erkek Giyim Ürünleri
INSERT INTO public.products (tenant_id, category_id, name, slug, description, base_price, sale_price, attributes, images, is_active, is_featured)
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'c3000000-0000-0000-0000-000000000003',
        'Oxford Pamuklu Gömlek',
        'oxford-pamuklu-gomlek',
        '%100 Organik pamuk, slim fit kesim.',
        899.90,
        null,
        '{"Beden": ["S", "M", "L", "XL"], "Renk": ["Beyaz", "Mavi", "Pembe"]}',
        '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]',
        true,
        true
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'c3000000-0000-0000-0000-000000000003',
        'Kargo Pantolon',
        'kargo-pantolon',
        'Dayanıklı kumaş, çok cepli kullanışlı tasarım.',
        1100.00,
        null,
        '{"Beden": ["30", "32", "34", "36"], "Renk": ["Haki", "Siyah"]}',
        '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600"]',
        true,
        false
    );

-- Aksesuarlar
INSERT INTO public.products (tenant_id, category_id, name, slug, description, base_price, sale_price, attributes, images, is_active, is_featured)
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'c4000000-0000-0000-0000-000000000004',
        'Minimalist Deri Çanta',
        'minimalist-deri-canta',
        'Hakiki deri, el yapımı omuz çantası.',
        2450.00,
        1999.00,
        '{"Renk": ["Taba", "Siyah"]}',
        '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"]',
        true,
        true
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'c4000000-0000-0000-0000-000000000004',
        'Güneş Gözlüğü',
        'gunes-gozlugu',
        'UV400 korumalı, retro tasarım.',
        450.00,
        null,
        '{"Renk": ["Siyah", "Kaplumbağa"]}',
        '["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"]',
        true,
        true
    );
