# Supabase Edge Functions

Bu dizin, Supabase Edge Functions için şablon içerir.

## Kurulum

```bash
# Supabase CLI kurulu olmalı
supabase functions new function-name
```

## Örnek Function: Order Analytics

```typescript
// supabase/functions/order-analytics/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { tenant_id, date_range } = await req.json()
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )
  
  const { data, error } = await supabase
    .from("order_events")
    .select("*")
    .eq("tenant_id", tenant_id)
    .gte("created_at", date_range.start)
    .lte("created_at", date_range.end)
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }
  
  return new Response(JSON.stringify({ data }), {
    headers: { "Content-Type": "application/json" }
  })
})
```

## Dağıtım

```bash
supabase functions deploy function-name
```
