# Dijital Vitrin SaaS v3.0

Çok kiracılı (multi-tenant) e-ticaret katalog platformu.

## Hızlı Başlangıç

```bash
npm install
npm run dev
```

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # login, register
│   ├── (dashboard)/       # dashboard CRUD
│   ├── (storefront)/      # [tenant]/[category]
│   └── api/events/        # Analitik API
├── components/
│   ├── ui/                # Shadcn UI
│   ├── filters/           # Drawer/Sheet
│   ├── forms/             # Dinamik form motoru
│   ├── shared/            # WhatsApp, scroll
│   └── storefront/        # Ürün/kategori kartları
├── hooks/                 # TanStack Query hooks
├── lib/
│   ├── forms/             # JSON → Zod
│   ├── query/             # QueryProvider
│   ├── supabase/          # Client/Server
│   └── validations/       # Zod şemaları
├── types/                 # TypeScript tipleri
└── middleware.ts          # Auth

supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_auth_hooks.sql
│   └── 004_rpc_functions.sql
└── functions/             # Edge Functions
```

## Reference.md Uyumu

| Bölüm | Özellik | ✓ |
|-------|---------|---|
| 2 | Multi-tenant RLS + JWT Claims | ✅ |
| 3 | JSONB + GIN + Faceted Search | ✅ |
| 4 | Drawer/Sheet + Glassmorphism | ✅ |
| 5 | Dinamik Form Motoru | ✅ |
| 6 | WhatsApp + Analytics API | ✅ |
| 7 | .cursorrules | ✅ |
| 8 | GDPR Hard Delete | ✅ |

## Ortam Değişkenleri

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
