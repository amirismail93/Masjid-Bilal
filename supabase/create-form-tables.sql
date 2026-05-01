-- ============================================================
-- Form Templates & Submissions tables
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- ============================================================

-- 1. Form Templates
CREATE TABLE IF NOT EXISTS form_templates (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug       text UNIQUE NOT NULL,
  name       text NOT NULL,
  description text DEFAULT '',
  fields     jsonb DEFAULT '[]'::jsonb,
  notification_emails text DEFAULT '',
  success_title  text DEFAULT 'Thank You!',
  success_message text DEFAULT 'Your submission has been received.',
  submit_label   text DEFAULT 'Submit',
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Generic Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_slug  text NOT NULL,
  data       jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Policies: anyone can read active templates (public forms need this)
CREATE POLICY "Anyone can read active form templates"
  ON form_templates FOR SELECT
  USING (true);

-- 5. Policies: authenticated users (admins) can do everything
CREATE POLICY "Admins can insert form templates"
  ON form_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update form templates"
  ON form_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete form templates"
  ON form_templates FOR DELETE
  TO authenticated
  USING (true);

-- 6. Anyone can insert submissions (public forms submit anonymously)
CREATE POLICY "Anyone can insert form submissions"
  ON form_submissions FOR INSERT
  WITH CHECK (true);

-- 7. Authenticated users can read/delete submissions
CREATE POLICY "Admins can read form submissions"
  ON form_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete form submissions"
  ON form_submissions FOR DELETE
  TO authenticated
  USING (true);

-- 8. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_templates_slug ON form_templates (slug);
CREATE INDEX IF NOT EXISTS idx_form_submissions_slug ON form_submissions (form_slug);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created ON form_submissions (created_at DESC);
