-- ============================================================
-- Add payment configuration to form_templates
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE form_templates
  ADD COLUMN IF NOT EXISTS payment_amount   integer,          -- in cents (e.g. 20000 = $200.00). NULL means no payment.
  ADD COLUMN IF NOT EXISTS payment_label    text,             -- e.g. "Nikah Fee", "Class Tuition"
  ADD COLUMN IF NOT EXISTS payment_required boolean DEFAULT false;  -- if true, payment page is shown after submission

-- Add linked_type + linked_id to payments table so we can trace back
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS linked_type text,      -- 'form_submission', 'class_enrollment', 'nikah_request'
  ADD COLUMN IF NOT EXISTS linked_id   text;      -- the id of the linked record

CREATE INDEX IF NOT EXISTS idx_payments_linked ON payments (linked_type, linked_id);
