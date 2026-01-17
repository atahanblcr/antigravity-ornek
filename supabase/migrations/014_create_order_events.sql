-- Create order_events table for tracking WhatsApp orders
CREATE TABLE public.order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'initiated', 'completed', 'abandoned', etc.
    session_id TEXT, -- Oturum kimliği (opsiyonel)
    cart_data JSONB DEFAULT '{}'::jsonb, -- Sepet/Ürün detayı
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enable
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Index for tenant_id (Required by Reference.md)
CREATE INDEX idx_order_events_tenant_id ON public.order_events(tenant_id);

-- Policies

-- 1. Insert Policy (Anyone can insert events - public access for storefront)
CREATE POLICY "Anyone can insert events" 
ON public.order_events 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);
-- Note: Ideally we would check tenant_id, but for public events from client side without auth, we often have to be permissive on insert, or use a signed token relative to tenant. 
-- However, strict adherence to Ref.md might suggest checking if tenant exists, but foreign key does that.
-- Let's stick to simple INSERT for now as per plan. 

-- 2. Select Policy (Only authenticated users can see their tenant's events)
CREATE POLICY "Authenticated users can select their tenant events" 
ON public.order_events 
FOR SELECT 
TO authenticated 
USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);

-- 3. Delete/Update (Not needed primarily, but maybe for cleanup/admin)
-- Only allow if tenant matches claim
CREATE POLICY "Authenticated users can delete their tenant events" 
ON public.order_events 
FOR DELETE 
TO authenticated 
USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);
