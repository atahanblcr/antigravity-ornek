-- RLS Policy Fix: Remove dependency on JWT custom claims for tenant updates
-- This fixes the issue where updates fail silently in local development if Auth Hooks aren't firing

DROP POLICY IF EXISTS "Kiracı sahibi düzenleyebilir" ON public.tenants;

CREATE POLICY "Kiracı sahibi düzenleyebilir"
ON public.tenants
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND tenant_id = tenants.id 
        AND role = 'owner'
    )
);
