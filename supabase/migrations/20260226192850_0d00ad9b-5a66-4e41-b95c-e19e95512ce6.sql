
-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resource-files', 'resource-files', true);

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload resource files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resource-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Resource files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'resource-files');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own resource files"
ON storage.objects FOR DELETE
USING (bucket_id = 'resource-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add file columns to resources table
ALTER TABLE public.resources
ADD COLUMN file_url text,
ADD COLUMN file_name text,
ADD COLUMN file_type text;
