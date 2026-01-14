Dijital Vitrin SaaS (v3.0) Teknik Mimari ve Uygulama Spesifikasyonu: AI Destekli Geliştirme Rehberi
1. Yönetici Özeti ve Mimari Vizyon

1.1 Belgenin Amacı ve Kapsamı
Bu doküman, "Dijital Vitrin SaaS" platformunun 3.0 sürümü için hazırlanan, yetkili teknik referans ve uygulama rehberidir. Temel amacı, Google Anti-Gravity, Cursor veya benzeri Büyük Dil Modeli (LLM) tabanlı AI kodlama asistanlarına, projenin mimari kısıtlamaları, kodlama standartları, tasarım desenleri ve güvenlik modelleri hakkında derinlemesine bağlam sağlamaktır. Bu rehber, yalnızca bir "nasıl yapılır" belgesi değil, aynı zamanda AI asistanının kod üretimi sırasında uyması gereken katı kuralları (hard constraints) ve tercih etmesi gereken yaklaşımları (soft preferences) tanımlayan bir "Anayasa" niteliğindedir.
"Dijital Vitrin" projesi, mobil öncelikli etkileşim için tasarlanmış, yüksek performanslı, çok kiracılı (multi-tenant) bir e-ticaret katalog sistemidir. Projenin 3.0 sürümü, önceki versiyonlardan farklı olarak, dinamik ürün nitelik yönetimi (attribute management), kesintisiz WhatsApp sipariş entegrasyonu ve paylaşılan altyapı içinde veri egemenliğini garanti eden güçlü bir kiracı izolasyon stratejisine odaklanmaktadır. Bu sürümdeki temel teknik hedef, sunucusuz (serverless) mimarinin ölçeklenebilirliğini, ilişkisel veritabanı bütünlüğü ve NoSQL esnekliği ile birleştirmektir.

1.2 AI Asistanı Operasyonel Direktifleri
Bu proje kapsamında kod üretimi, refactoring veya hata ayıklama işlemleri gerçekleştirecek olan AI asistanı, aşağıdaki operasyonel mandalara kesinlikle uymalıdır. Bu direktifler, projenin teknik borç (technical debt) oluşturmadan büyümesini sağlamak için kritiktir:
Bağlam Farkındalığı (Context Awareness): Üretilen her kod parçası, uygulamanın "çok kiracılı" doğasının farkında olmalıdır. Veritabanı sorguları, API uç noktaları veya arayüz bileşenleri oluşturulurken, tenant_id veya organization_id izolasyon katmanı, açık ve net bir şekilde dikkate alınmalıdır. "Varsayılan" olarak tekil kullanıcı senaryosu asla uygulanmamalıdır.
Savunma Derinliği (Defense in Depth) ve Önce Güvenlik: Satır Düzeyinde Güvenlik (Row-Level Security - RLS), veri korumasının birincil mekanizmasıdır. Uygulama katmanındaki filtreleme mantığı (middleware veya WHERE koşulları) sadece bir kullanıcı deneyimi optimizasyonudur; güvenlik garantisi değildir. AI, RLS politikalarını her zaman uygulama mantığının önüne koymalıdır.1
Tip Güvenliği ve Doğrulama: Proje, katı TypeScript (Strict Mode) kurallarını zorunlu kılar. any tipinin kullanımı kesinlikle yasaktır ve teknik bir hata olarak kabul edilir. Çalışma zamanı (runtime) doğrulaması ve tip çıkarımı (type inference) için "Zod" şemaları, tek doğruluk kaynağı (Single Source of Truth) olarak kullanılmalıdır.3
Bileşen Kompozisyonu: Kullanıcı arayüzü geliştirmesi, Shadcn UI ilkel bileşenlerini (primitives) temel almalıdır. Kalıtım (inheritance) yerine kompozisyon (composition) tercih edilmeli ve Bölüm 4'te detaylandırılan "Mobil için Drawer / Masaüstü için Sheet" etkileşim deseni katı bir şekilde uygulanmalıdır.5
Maliyet ve Performans Bilinci: Veritabanı sorguları ve kenar fonksiyonları (edge functions), sunucusuz ortamların maliyet yapısı gözetilerek optimize edilmelidir. Gereksiz veri çekme (over-fetching) veya N+1 sorgu problemlerinden kaçınılmalıdır.

1.3 Dijital Vitrin v3.0'ın Temel Değer Önerisi
Dijital Vitrin v3.0, geleneksel e-ticaret sitelerinin karmaşıklığı ile basit katalog uygulamalarının yetersizliği arasındaki boşluğu doldurmayı hedefler. Platformun temel değeri, "Görünürlük ve Hız" üzerine kuruludur. Kullanıcılar, saniyeler içinde açılan bir vitrine ulaşmalı, aradıkları ürünü bulmalı ve ödeme geçitleri veya üyelik formları ile uğraşmadan, doğrudan WhatsApp üzerinden satıcı ile etkileşime geçebilmelidir. Bu "sürtünmesiz" (frictionless) deneyim, arka planda karmaşık bir veri modelleme ve önbellekleme stratejisi gerektirir.

2. Çok Kiracılı (Multi-Tenant) Veritabanı Mimarisi
Dijital Vitrin SaaS'ın omurgası, yüksek ölçekli çok kiracılı kullanım için yapılandırılmış Supabase (PostgreSQL) üzerinde çalışır. Mimari tasarım sürecinde, her kiracı için ayrı bir veritabanı oluşturma ("Database-per-tenant") modeli değerlendirilmiş, ancak operasyonel karmaşıklık ve maliyet verimsizliği nedeniyle reddedilmiştir. Bunun yerine, binlerce küçük ve orta ölçekli kiracıyı (SMB) barındırabilecek, maliyet etkin ve yönetim kolaylığı sağlayan, Satır Düzeyinde Güvenlik (RLS) ile güçlendirilmiş "Paylaşılan Şema" (Shared Schema) yaklaşımı benimsenmiştir.2

2.1 İzolasyon Stratejisi ve Şema Tasarımı
Bu mimaride, veritabanındaki verilerin mantıksal izolasyonunu sağlayan temel birim tenant_id (UUID formatında) sütunudur. Kiracıya özgü veri içeren (örneğin; ürünler, siparişler, kategoriler, müşteri kayıtları) her tablo, istisnasız olarak bu sütunu içermek zorundadır. Bu, AI asistanının veritabanı şeması önerirken veya SQL migrasyon dosyaları oluştururken uyması gereken en temel kuraldır.

2.1.1 Kiracı Kimliği Tespiti: Profil Tablosu vs. Özel Talepler (Custom Claims)
Çok kiracılı sistemlerde en kritik mimari kararlardan biri, bir isteğin (request) hangi kiracıya ait olduğunun veritabanı seviyesinde nasıl tespit edileceğidir. Geleneksel yaklaşım, kullanıcının kimliğini (auth.uid()) alıp, bir memberships veya profiles tablosuna JOIN işlemi yaparak kiracı bilgisini sorgulamayı içerir. Ancak, Dijital Vitrin v3.0 gibi yüksek okuma trafiğine sahip (Vitrin görüntülemeleri) bir sistemde, her bir satır için (FOR EACH ROW) bu JOIN işleminin yapılması, RLS performansında ciddi darboğazlar yaratır.8
Karar: v3.0 mimarisi, JWT Özel Talepler (Custom Claims) mekanizmasını kullanmayı zorunlu kılar.
Mekanizma: Kullanıcı sisteme giriş yaptığında (Login), Supabase Auth servisi bir JWT üretir. Bu aşamada, bir PostgreSQL veritabanı fonksiyonu (Hook) devreye girerek, kullanıcının tenant_id bilgisini ve yetki rollerini doğrudan bu JWT'nin app_metadata bölümüne yazar.
RLS Politika Optimizasyonu: RLS politikaları yazılırken, profiles tablosuna gitmek yerine, auth.jwt() fonksiyonu kullanılarak kiracı kimliği doğrudan oturum belirtecinden (token) okunur. Bu, veritabanı sorgu planlayıcısının (Query Planner), karmaşık yarı-birleştirmeler (semi-joins) yerine, doğrudan indeks taraması (Index Scan) yapmasını sağlar.
AI İçin Uygulama Direktifi:
SQL politikaları üretilirken, USING bloğu içinde alt sorgu (subquery) kullanımı, yalnızca kaçınılmaz olduğu durumlarda kabul edilebilir. Tercih edilen ve varsayılan olarak uygulanması gereken desen, kiracı bağlamının oturum taleplerinden (claims) alınmasıdır:

SQL


-- Tercih Edilen Desen: JWT Claim Üzerinden Kiracı İzolasyonu
-- Bu desen, veritabanı performansını maksimize eder ve JOIN maliyetini ortadan kaldırır.

CREATE POLICY "Kiracı Veri İzolasyon Politikası"
ON public.products
FOR ALL
TO authenticated
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);

-- Hatalı Desen (Kaçınılması Gereken): Her satırda profiller tablosunu sorgulama
-- CREATE POLICY "Yavaş Politika" ON public.products
-- USING (
--   tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
-- );


Bu yaklaşım, özellikle binlerce ürünün listelendiği katalog sayfalarında sorgu süresini milisaniyeler mertebesine indirerek, kullanıcı deneyimini doğrudan iyileştirir.8

2.2 Satır Düzeyinde Güvenlik (RLS) En İyi Uygulamaları
Dijital Vitrin v3.0'da güvenlik, "Savunma Derinliği" stratejisi ile ele alınır. Uygulama katmanı (API endpointleri, middleware), geçersiz istekleri filtreleyerek ilk savunma hattını oluşturur. Ancak veritabanı katmanı (RLS), asla atlatılamayan (non-bypassable) nihai güvenlik garantisidir. AI asistanı, kod üretirken "uygulama mantığı hatalı olsa bile verinin sızmayacağı" bir yapı kurmalıdır.

2.2.1 Politika Hiyerarşisi ve Yapısı
AI, RLS politikalarını yapılandırırken CRUD (Oluştur, Oku, Güncelle, Sil) operasyonlarını ayrı ayrı ve açıkça ele almalıdır. "Kısıtlayıcı" (RESTRICTIVE) politikalar yerine, karmaşık kesişim kuralları gerektirmediği sürece "İzin Verici" (PERMISSIVE) politika stili teşvik edilir.11
SELECT Politikaları: Kesinlikle tenant_id eşleşmesine dayanmalıdır. Ancak, "Vitrin" tarafında herkese açık (public) veriler için özel bir durum vardır. Ürünlerin son kullanıcılar tarafından görüntülenebilmesi için, anon (anonim) rolüne izin veren, ancak is_public = true ve ilgili tenant_id filtresini içeren ayrı bir politika tanımlanmalıdır.
INSERT Politikaları: Mutlaka WITH CHECK ifadesini içermelidir. Bu ifade, yeni eklenen satırın tenant_id değerinin, işlemi yapan kullanıcının tenant_id değeri ile eşleştiğini garanti etmelidir. Bu, kötü niyetli bir kullanıcının, kendi yetkisiyle başka bir kiracının alanına veri enjekte etmesini engeller.
UPDATE/DELETE Politikaları: Sahiplik ilkesini katı bir şekilde uygulamalıdır. Sadece veriyi oluşturan kiracı (veya o kiracının yetkili yöneticisi) veriyi değiştirebilmelidir.

2.2.2 RLS Performans Kriterleri
RLS politikaları, taranan her satır için veritabanı motoru tarafından değerlendirilir. Verimsiz bir politika, tüm sistemin performansını çökertebilir.
İndeks Zorunluluğu: tenant_id sütunu, istisnasız her tabloda indekslenmelidir. AI asistanı, yeni bir tablo tanımı (DDL) oluştururken, otomatik olarak CREATE INDEX ON table_name (tenant_id); komutunu da migrasyon dosyasına eklemelidir.1
Fonksiyon Sarmalama (Function Wrapping): JWT talepleriyle çözülemeyen karmaşık mantıklar (örneğin; hiyerarşik rol kontrolleri) için, mantık SECURITY DEFINER olarak işaretlenmiş bir PostgreSQL fonksiyonu içine hapsedilmelidir. Bu, RLS'in sonsuz döngüye (recursion) girmesini engeller ve sorgu planlayıcısının optimizasyon yapmasına olanak tanır.10

2.3 Kullanıcı Yönetimi ve Senkronizasyon
Sistem, kimlik doğrulama için Supabase Auth servisini kullanır. Ancak, kullanıcıların uygulama içindeki profilleri (Ad, Soyad, Avatar, Tercih Edilen Dil vb.) public.profiles tablosunda saklanır. auth.users tablosu (Supabase yönetimindeki şema) ile public.profiles tablosu arasındaki veri bütünlüğü kritiktir.
Tetikleyici (Trigger) Tabanlı Senkronizasyon:
AI asistanı, bu iki tablo arasındaki senkronizasyonu uygulama katmanına bırakmamalıdır. PostgreSQL tetikleyicileri (Triggers) kullanılarak, auth.users tablosuna yeni bir kayıt eklendiğinde, public.profiles tablosunda otomatik olarak ilgili satırı oluşturan bir PL/pgSQL fonksiyonu yazılmalıdır. Bu, "kullanıcı var ama profili yok" şeklindeki tutarsızlıkları (orphaned records) kesin olarak önler.

3. Hibrit Veri Modelleme: İlişkisel Bütünlük ve JSONB Esnekliği
"Dijital Vitrin" projesinin temel zorluklarından biri, çok çeşitli sektörlere hizmet verebilme esnekliğidir. Bir giyim mağazası "Beden" ve "Renk" gibi niteliklere ihtiyaç duyarken, bir elektronik tamircisi "Model Yılı", "Arıza Tipi" gibi tamamen farklı veri alanlarına ihtiyaç duyar. Klasik ilişkisel veritabanı tasarımı (EAV - Entity Attribute Value modeli gibi) bu durumda performans ve sorgulama zorlukları yaratır. Bu nedenle, v3.0 mimarisi, PostgreSQL'in güçlü JSONB veri tipini stratejik olarak kullanır.

3.1 JSONB Kullanım Stratejisi
Ürünlerin "Ad", "Fiyat", "Stok Kodu" gibi evrensel nitelikleri standart ilişkisel sütunlarda tutulurken; kategoriye göre değişen spesifik özellikler attributes isimli bir JSONB sütununda saklanır.
Şema Tanımı Örneği:

SQL


CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    -- Dinamik özellikler burada saklanır. Örn: {"size": "L", "color": "Red"}
    attributes JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


3.2 Performans İçin GIN İndeksleme
Standart B-Tree indeksleri, JSON verisinin içindeki alanları sorgulamak için verimsizdir. Örneğin, "Rengi Kırmızı olan ürünleri getir" sorgusu, B-Tree ile tüm tabloyu taramayı gerektirir. Bu nedenle, v3.0 mimarisi Genelleştirilmiş Ters İndeks (Generalized Inverted Index - GIN) kullanımını zorunlu kılar.13
İndeksleme Direktifi:
AI asistanı, filtreleme yapılması muhtemel herhangi bir JSONB sütunu için GIN indeksi oluşturmalıdır. Burada iki temel operatör sınıfı (operator class) değerlendirilmelidir:
jsonb_ops (Varsayılan): Varlık (?, ?|, ?&) ve kapsama (@>) operatörlerini destekler. Daha çok yer kaplar ancak anahtar (key) varlığı sorguları için gereklidir.
jsonb_path_ops: Sadece kapsama (@>) operatörünü destekler. Ancak indeks boyutu çok daha küçüktür ve filtreleme işlemleri daha hızlıdır.
Karar: "Vitrin" ürün filtreleme senaryosunda, genellikle "Şu özelliğe sahip olanlar" (@>) sorgusu çalıştırılacağı için, performans önceliği nedeniyle jsonb_path_ops tercih edilmelidir.14

SQL


-- Ürün Filtreleme İçin Yüksek Performanslı GIN İndeksi
CREATE INDEX idx_products_attributes 
ON public.products 
USING GIN (attributes jsonb_path_ops);


3.3 JSONB Verisini Sorgulama
AI kodlama asistanı, uygulama kodu içinde (örneğin Supabase JavaScript istemcisi ile) sorgu oluştururken, GIN indeksini devreye sokan operatörleri kullanmaya zorlanmalıdır.
Verimsiz Yöntem (Yasaklı): attributes->>'color' = 'Red' şeklinde yapılan sorgular, metin tabanlı karşılaştırma yapar ve GIN indeksini etkin kullanamaz (B-Tree expression index tanımlanmadığı sürece).
Verimli Yöntem (Zorunlu): attributes @> '{"color": "Red"}' sözdizimi kullanılmalıdır. Bu "Kapsama" (Containment) operatörü, GIN indeksindeki ikili haritayı (bitmap) kullanarak, milyonlarca satır arasından eşleşenleri milisaniyeler içinde bulur.15

3.4 Dinamik Filtreler ve Ayrık Değerler (Distinct Values)
Kullanıcı arayüzünde (UI) filtreleme menülerini oluşturmak için (örneğin; "Mevcut Bedenler: S, M, L"), JSON sütunundaki tüm benzersiz değerlerin çekilmesi gerekir. Bu işlem büyük veri setlerinde maliyetlidir.
AI asistanı, bu verileri çekmek için PostgreSQL'in jsonb_each veya jsonb_array_elements fonksiyonlarını kullanan sorgular oluşturmalıdır.18
Fasetli Arama (Faceted Search) Sorgusu:

SQL


-- Belirli bir kiracının ürünlerinde geçen tüm "Beden" (Size) değerlerini getir
SELECT DISTINCT value 
FROM products, jsonb_each_text(attributes) 
WHERE key = 'Size' AND tenant_id = 'ilgili_tenant_id';


Not: Veri seti kiracı başına 100.000 satırı aştığında, bu sorgunun her sayfa yüklemesinde çalıştırılması yerine, bir "Materialized View" kullanılması veya product_facets adında ayrı bir özet tablonun tetikleyicilerle güncellenmesi mimari bir zorunluluk haline gelir.

4. Frontend Mimarisi ve Kullanıcı Deneyimi Desenleri
Frontend altyapısı, SEO performansı ve ilk yükleme hızı (First Contentful Paint - FCP) kritik olduğu için, sunucu tarafı işlemeye (SSR) olanak tanıyan Next.js App Router üzerine inşa edilmiştir.

4.1 Bileşen Kütüphanesi: Shadcn UI ve "Glassmorphism"
Kullanıcı arayüzü, erişilebilirliği (accessibility) ve özelleştirilebilirliği garanti altına almak için Shadcn UI temelleri üzerine kuruludur. "Vitrin" markası, şeffaflık ve zarafet çağrışımı yaptığı için, "Glassmorphism" estetiği benimsenmiştir.
Stil Direktifi:
AI asistanı, bileşenlere stil verirken Tailwind CSS'in backdrop-blur ve bg-opacity özelliklerini kullanarak bu estetiği yakalamalıdır.

CSS


/* Glass Panel Utility Sınıfı */
.glass-panel {
  @apply bg-white/70 backdrop-blur-md border border-white/20 shadow-xl;
}
.dark.glass-panel {
  @apply bg-black/70 backdrop-blur-md border border-white/10 shadow-xl;
}


4.2 Mobil Öncelikli Gezinti ve Filtreleme
"Dijital Vitrin" trafiğinin %80'inden fazlasının mobil cihazlardan gelmesi beklendiğinden, arayüz tasarımı "Mobil Öncelikli" (Mobile-First) değil, "Mobil Zorunlu" bir yaklaşımla ele alınmalıdır.

4.2.1 Filtreleme Deneyimi: Drawer (Mobil) vs. Sheet (Masaüstü)
Mobil filtreleme arayüzleri için UX literatüründe kritik bir ayrım vardır: Kullanıcının parmak erişim alanı (Thumb Zone) ve bağlamın korunması. Bu nedenle, v3.0 mimarisi, mobil ve masaüstü için iki farklı bileşen davranışını zorunlu kılar.20
Masaüstü (Sheet / Sidebar): Ekranın sağ veya sol tarafından kayarak gelen Sheet bileşeni kullanılır. Masaüstü kullanıcıları dikey alana sahiptir ve yan paneller içeriği kapatmadan kullanılabilir.
Mobil (Drawer / Bottom Sheet): Ekranın altından yukarı doğru açılan Drawer bileşeni zorunludur. Drawer, mobil kullanıcının tek elle (başparmak ile) filtreleri yönetmesine olanak tanır ve arkadaki içeriğin bir kısmını göstererek kullanıcının bağlamdan kopmamasını sağlar.20
Uygulama Direktifi:
AI asistanı, bu deseni uygulamak için duyarlı (responsive) bir soyutlama katmanı oluşturmalıdır:
useMediaQuery kancası (hook) ile ekran genişliği algılanır.
< 768px ise Drawer bileşeni, içerisine filtre formunu alarak render edilir.
>= 768px ise Sheet bileşeni aynı formu kullanarak render edilir.
Kod tekrarını önlemek için, formun kendisi FilterContent adında bağımsız bir bileşen olarak tasarlanmalı ve her iki taşıyıcıya (container) da prop olarak geçilmelidir.5
Özellik
Mobil (Drawer)
Masaüstü (Sheet)
Giriş Yönü
Alttan Yukarı
Sağdan/Soldan
Ergonomi
Tek el / Başparmak
Mouse / Trackpad
Bağlam
Yarı Modal (Arkası kısmen görünür)
Tam Yükseklik Paneli
Kapatma
Aşağı Kaydırma (Swipe Down)
Dışarı Tıklama / X Butonu

4.2.2 Yapışkan Alt Bilgi (Sticky Footer) ve Düzen Kaymaları
Mobil ödeme/sipariş akışlarında, "WhatsApp ile Sipariş Ver" butonu hayati önem taşır. Bu butonun, sayfa içeriği ne kadar uzun olursa olsun her zaman görünür olması, ancak içeriğin üzerini kapatmaması gerekir. AI asistanı, Tailwind'in sticky bottom-0 sınıfını kullanarak bu alanı sabitlemeli, ancak iOS Safari'nin dinamik alt çubuğunu (address bar) hesaba katarak pb-safe (padding-bottom-safe-area) gibi güvenli alan yardımcı sınıflarını eklemelidir.23

4.3 Yatay Kaydırma Alanları ve Performans
Ürün kategorileri (örn: "Yeni Gelenler", "Çok Satanlar") genellikle yatay kaydırma listeleri olarak sunulur. Shadcn ScrollArea bileşeni, masaüstünde şık, ince kaydırma çubukları sağlasa da, mobildeki doğal "ivmeli kaydırma" (momentum scrolling) hissini bozabilir.
Kısıtlama: Mobil cihazlar için yatay listelerde, AI asistanı ScrollArea bileşeni yerine, doğal CSS snap-x ve snap-mandatory özelliklerini kullanan, overflow-x-auto sınıfına sahip div yapılarını tercih etmelidir. Bu, "native" uygulama hissi verir ve JavaScript yükünü azaltır.24

5. Dinamik Form Motoru: JSON Şemadan Çalışma Zamanı Doğrulamasına
"Dijital Vitrin" SaaS'ın en güçlü yanlarından biri, kiracıların ürünleri için özel sipariş formları tanımlayabilmesidir. Örneğin, bir takı tasarımcısı, müşterisinden "Yüzük İçi Yazı" ve "Font Tipi" bilgisini almak isterken; bir pastane "Teslimat Tarihi" ve "Alerjen Notu" isteyebilir. Bu çeşitlilik, sabit kodlanmış (hardcoded) formlarla yönetilemez.

5.1 Mimari Akış: JSON Schema -> Zod -> React Hook Form
Sistem, veritabanında saklanan JSON konfigürasyonunu, istemci tarafında (client-side) çalışan, tip güvenli ve doğrulanabilir formlara dönüştüren bir boru hattı (pipeline) kullanır.
Tek Doğruluk Kaynağı (Veritabanı): Form yapısı, veritabanında JSON formatında saklanır. Bu JSON, alanın tipini (text, number, select), etiketini, zorunluluk durumunu ve doğrulama kurallarını (min, max, regex) içerir.
Şema Dönüşümü (Runtime): Uygulama yüklendiğinde, bu JSON verisi json-schema-to-zod benzeri bir yardımcı fonksiyon ile çalışma zamanında dinamik bir Zod şemasına dönüştürülür.
Form Yönetimi: React Hook Form (RHF), oluşturulan bu dinamik Zod şemasını zodResolver aracılığıyla kullanarak, formun durumunu yönetir ve hataları yakalar.25

5.2 Tip Güvenliği ve TypeScript Entegrasyonu
Dinamik formlarda en büyük risk, TypeScript'in sağladığı tip güvenliğinin kaybedilmesidir. AI asistanı, bu riski minimize etmek için Zod'un z.infer yeteneklerini kullanmalıdır. Ancak, şema çalışma zamanında oluştuğu için, API isteklerini karşılayan fonksiyonlar (handlers), gelen veriyi Record<string, unknown> olarak kabul etmeli ve işlem yapmadan önce mutlaka ilgili Zod şeması ile (schema.parse()) doğrulamalıdır.4

5.3 Performans: Şema Memoizasyonu
React bileşenleri her render edildiğinde Zod şemasını yeniden oluşturmak, React Hook Form'un durumunu (state) kaybetmesine ve input odağının (focus) bozulmasına neden olur.
Kritik Kural: AI asistanı, dinamik şema oluşturma mantığını mutlaka useMemo kancası içine almalıdır. Şema nesnesi, sadece form konfigürasyon JSON'ı değiştiğinde yeniden hesaplanmalıdır.

TypeScript


// AI Bağlamı: Dinamik şema için doğru desen
const schema = useMemo(() => {
  //... JSON'dan Zod'a dönüşüm mantığı
  return z.object(shape);
},); // Sadece config değişince çalışır


6. Entegrasyon ve Dönüşüm: WhatsApp Ticareti
Projenin birincil dönüşüm (conversion) mekanizması, tam teşekküllü bir ödeme ağ geçidi entegrasyonu (Sanlar POS vb.) değil, maliyet etkinliği ve hız sağlayan "WhatsApp İle Sipariş" modelidir. Bu model, siparişin web sitesinde hazırlanıp, detayların yapılandırılmış bir mesaj olarak WhatsApp'a taşınmasına dayanır.

6.1 URL Yapısı ve Kodlama Standartları
AI asistanı, WhatsApp "Click to Chat" API'sini kullanırken, iOS, Android ve Web sürümleriyle tam uyumluluk sağlamak için resmi yönergelere sıkı sıkıya uymalıdır.27
Temel URL: https://wa.me/<telefon_numarasi>
Numara Formatı: Uluslararası format kullanılmalı, ancak baştaki +, 00 veya parantez/tire gibi karakterler temizlenmelidir. (Örn: 905551234567). AI, bu temizliği yapan bir formatWhatsAppNumber(input) yardımcı fonksiyonu yazmalıdır.29
Mesaj Parametresi: text parametresi URL-encoded olmalıdır.
Boşluk: %20 olarak kodlanmalıdır.
Satır Sonu: Sipariş listesinin okunabilirliği için satır sonları kritik öneme sahiptir. Bunlar %0A olarak kodlanmalıdır.30
Sipariş Mesajı Şablon Stratejisi:
Sistem tarafından oluşturulan mesaj, satıcının siparişi hızlıca işlemesini sağlayacak yapıda olmalıdır:
Merhaba [Mağaza Adı],
Aşağıdaki ürünleri sipariş etmek istiyorum:
[Ürün Adı] (x2) -
[Ürün Adı] (Renk: Kırmızı, Beden: M)
Toplam Tutar: TL
Sipariş Referansı:

6.2 Durumsuz (Stateless) Sipariş Yönetimi
v3.0 mimarisi, başlangıçta veritabanında ağır bir sipariş tablosu yönetimini ("Stateful") zorunlu kılmaz. Sipariş, kullanıcı tarayıcısında (Local Storage / Zustand) oluşturulur ve WhatsApp'a aktarıldığı anda sorumluluk satıcıya geçer.
Avantaj: Veritabanı yazma maliyetlerini düşürür ve ödeme sistemi entegrasyonu yükünü kaldırır.
Dezavantaj: Stok takibi otomatik düşmez.
Analitik İçin Çözüm: AI asistanı, kullanıcı "Sipariş Ver" butonuna bastığında, WhatsApp'a yönlendirmeden önce arka planda (non-blocking) basit bir "Sipariş Başlatıldı" olayı (event) kaydeden bir API rotası oluşturmalıdır. Bu, dönüşüm oranlarını ölçmek için gereklidir.

7. AI Asistanı Yapılandırması (.cursorrules)
Geliştirme sürecinde tutarlılığı sağlamak için, projenin kök dizininde yer alan ve AI asistanının davranışlarını yöneten .cursorrules dosyası hiyerarşik bir yapıda kurgulanmalıdır.32

7.1 Kural Hiyerarşisi ve Yapısı
Token kullanımını optimize etmek ve bağlamı dağıtmamak için kurallar katmanlara ayrılır.
Global Kurallar (.cursorrules):
Rol: Kıdemli Full-Stack Mimar.
Teknoloji Yığını: Next.js 14+ (App Router), TypeScript, Supabase, Tailwind CSS, Shadcn UI.
Kodlama Stili: Fonksiyonel bileşenler, Erken dönüş (Early return) deseni, Zod ile veri doğrulama.
Yasaklar: Class component kullanımı, any tipi, satır içi (inline) stiller.
Bağlama Özgü Kurallar (.cursor/rules/*.mdc):
Backend (supabase.mdc): "Her veritabanı sorgusu tenant_id içermelidir." kuralını, "Auth kontrolleri için auth.jwt() kullanılmalıdır." kuralını barındırır.
Frontend (ui.mdc): "Mobil görünümler için md:hidden kullanılmalı", "Filtreler için mobilde Drawer kullanılmalı" gibi UI spesifikasyonlarını içerir.

7.2 Örnek Kural Tanımı
Aşağıdaki blok, AI asistanının projenin bağlamını anlaması için .cursorrules dosyasına eklenecek temel direktiftir:
#.cursorrules

Proje: Dijital Vitrin SaaS v3.0
1. Bağlam ve Prensipler
Çok Kiracılılık (Multi-Tenancy): Yazılan her SQL sorgusu, API rotası ve veri çekme kancası, mutlaka tenant_id bağlamını gözetmelidir. Veri sızıntısı kabul edilemez.
Mobil Öncelik: UI kodları önce mobil ekranlar için yazılmalı, masaüstü için md: veya lg: ön ekleri ile genişletilmelidir (Mobile-First Tailwind).
Performans: JSONB sütunlarında sorgu yaparken @> operatörü kullanılmalıdır. Gereksiz modül importlarından kaçınılmalıdır.

2. Teknoloji Yığını Zorunlulukları
Sunucu Durumu (Server State): Veri çekme işlemleri için TanStack Query (React Query) kullanılmalıdır.
İstemci Durumu (Client State): Global durum yönetimi için Zustand tercih edilmelidir.
Formlar: React Hook Form ve Zod entegrasyonu standarttır.
UI: Shadcn UI bileşenleri temel alınmalıdır. Özel CSS yazmak yerine Tailwind utility sınıfları kullanılmalıdır.

3. Kodlama Standartları
Fonksiyon tanımları için const (arrow function) kullanılmalıdır.
Tüm prop'lar ve dönüş değerleri TypeScript ile açıkça tiplenmelidir.
Dosya isimlendirmeleri kebab-case.tsx formatında olmalıdır.
Tekrar eden mantıklar özel kancalara (use-feature.ts) taşınmalıdır.


8. Güvenlik, Uyumluluk ve Dağıtım

8.1 Ortam Değişkenleri ve Gizlilik
Çok kiracılı bir yapıda, ortam değişkenlerinin (Environment Variables) yanlış yönetimi felakete yol açabilir.
NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY: İstemci tarafında güvenle ifşa edilebilir.
SUPABASE_SERVICE_ROLE_KEY: Kesinlikle Gizlidir. Bu anahtar RLS politikalarını baypas eder (Admin yetkisi). AI asistanı, bu anahtarın istemci tarafında (Client Component) kullanıldığı herhangi bir kod bloğu üretmemeli, üretirse kullanıcıyı uyarmalıdır.12

8.2 GDPR/KVKK ve Veri Egemenliği
Her ne kadar "Paylaşılan Şema" modeli kullanılsa da, veritabanı tasarımında "Soft Delete" (Yumuşak Silme) mekanizması kullanılır. Ancak, bir kullanıcı (veya kiracı) "Hesabımı Sil" (Right to be Forgotten) talebinde bulunduğunda, AI asistanının üreteceği fonksiyon, ilgili tenant_id'ye ait tüm verileri ilişkisel bütünlük içinde ve kalıcı olarak (Hard Delete) silecek prosedürleri içermelidir. Sadece is_active = false yapmak, yasal uyumluluk (GDPR) için yeterli değildir.

9. Sonuç
"Dijital Vitrin SaaS" v3.0 mimarisi, katı veritabanı güvenliği (Supabase RLS) ile esnek veri modelleme (PostgreSQL JSONB) arasındaki hassas denge üzerine kuruludur. Veritabanı katmanına yüklenen iş mantığı (indeksler ve politikalar) sayesinde uygulama katmanı hafifletilmiş; Shadcn UI ve Next.js ile kurulan frontend yapısı sayesinde ise yüksek performanslı ve mobil öncelikli bir deneyim hedeflenmiştir. Bu dokümandaki yönergelere uyularak üretilecek kodlar, sadece çalışan bir uygulama değil; ölçeklenebilir, güvenli ve bakımı kolay bir yazılım ekosistemi oluşturacaktır.
