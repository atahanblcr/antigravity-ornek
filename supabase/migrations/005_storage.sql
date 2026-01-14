-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Public can view images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'products' );

-- 2. Authenticated users can upload to their tenant's folder
-- Path convention: {tenant_id}/{filename}
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'products' 
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
);

-- 3. Users can update/delete their own tenant's files
CREATE POLICY "Users can update their own files" 
ON storage.objects FOR UPDATE
TO authenticated 
USING (
    bucket_id = 'products' 
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
);

CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE
TO authenticated 
USING (
    bucket_id = 'products' 
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
);
