-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create new policies that check profiles table
-- INSERT
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'products' 
    AND (storage.foldername(name))[1] IN (
        SELECT tenant_id::text 
        FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);

-- UPDATE
CREATE POLICY "Users can update their own files" 
ON storage.objects FOR UPDATE
TO authenticated 
USING (
    bucket_id = 'products' 
    AND (storage.foldername(name))[1] IN (
        SELECT tenant_id::text 
        FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);

-- DELETE
CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE
TO authenticated 
USING (
    bucket_id = 'products' 
    AND (storage.foldername(name))[1] IN (
        SELECT tenant_id::text 
        FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);
