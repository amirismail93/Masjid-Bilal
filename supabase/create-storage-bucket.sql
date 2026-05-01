-- Create a public storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files (public bucket)
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated update access"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'uploads');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated delete access"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads');
