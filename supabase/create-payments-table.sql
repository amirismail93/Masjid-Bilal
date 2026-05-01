-- ============================================================
-- Payments table (Stripe integration)
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_payment_id text UNIQUE,
  stripe_session_id text,
  stripe_customer_id text,
  amount            integer NOT NULL,          -- in cents
  currency          text DEFAULT 'usd',
  status            text DEFAULT 'pending',    -- pending, completed, failed, refunded
  category          text DEFAULT 'general',    -- general, education, youth, kitchen, building, zakat, sadaqah, class, nikah, rental
  designation       text,                      -- human-readable label
  donor_name        text,
  donor_email       text,
  is_recurring      boolean DEFAULT false,
  recurring_interval text,                     -- month, year
  stripe_subscription_id text,
  metadata          jsonb DEFAULT '{}'::jsonb,  -- extra info (class_id, nikah_request_id, etc.)
  created_at        timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins) can read all payments
CREATE POLICY "Admins can read payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

-- Service role inserts (webhook)
CREATE POLICY "Service role can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Service role can update
CREATE POLICY "Service role can update payments"
  ON payments FOR UPDATE
  WITH CHECK (true);

-- Admins can delete
CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_category ON payments (category);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments (donor_email);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments (stripe_session_id);
