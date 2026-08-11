-- ============================================================
-- MedTrack — RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR
-- Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- 1. TABLES
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  dosage_per_take INT DEFAULT 1,
  time_of_day VARCHAR(20) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  pack_size INT NOT NULL DEFAULT 10,
  daily_frequency INT NOT NULL DEFAULT 1,
  low_stock_threshold_days INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_time_of_day VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS google_task_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  google_task_id TEXT,
  task_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_patient ON dose_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_medication ON dose_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_logged_at ON dose_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_google_task_sync_med ON google_task_sync_log(medication_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_integrations_user_provider ON user_integrations(user_id, provider);

-- 3. AUTO STOCK DECREMENT
CREATE OR REPLACE FUNCTION decrement_stock_on_dose_taken()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'taken' THEN
    UPDATE medications
    SET current_stock = GREATEST(0, current_stock - dosage_per_take),
        updated_at = NOW()
    WHERE id = NEW.medication_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_stock ON dose_logs;
CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON dose_logs
FOR EACH ROW EXECUTE FUNCTION decrement_stock_on_dose_taken();

-- 4. ROW LEVEL SECURITY
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_task_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caregiver_all_patients" ON patients;
DROP POLICY IF EXISTS "caregiver_all_medications" ON medications;
DROP POLICY IF EXISTS "caregiver_all_dose_logs" ON dose_logs;
DROP POLICY IF EXISTS "caregiver_own_integrations" ON user_integrations;
DROP POLICY IF EXISTS "caregiver_own_push_subs" ON push_subscriptions;
DROP POLICY IF EXISTS "caregiver_read_task_sync" ON google_task_sync_log;
DROP POLICY IF EXISTS "caregiver_insert_task_sync" ON google_task_sync_log;
DROP POLICY IF EXISTS "kiosk_read_patients" ON patients;
DROP POLICY IF EXISTS "kiosk_read_medications" ON medications;
DROP POLICY IF EXISTS "kiosk_read_dose_logs" ON dose_logs;
DROP POLICY IF EXISTS "kiosk_insert_dose_logs" ON dose_logs;

CREATE POLICY "caregiver_all_patients" ON patients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "caregiver_all_medications" ON medications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "caregiver_all_dose_logs" ON dose_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "caregiver_own_integrations" ON user_integrations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "caregiver_own_push_subs" ON push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "caregiver_read_task_sync" ON google_task_sync_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "caregiver_insert_task_sync" ON google_task_sync_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "kiosk_read_patients" ON patients FOR SELECT TO anon USING (true);
CREATE POLICY "kiosk_read_medications" ON medications FOR SELECT TO anon USING (true);
CREATE POLICY "kiosk_read_dose_logs" ON dose_logs FOR SELECT TO anon USING (true);
CREATE POLICY "kiosk_insert_dose_logs" ON dose_logs FOR INSERT TO anon WITH CHECK (true);

-- 5. REALTIME (ignore errors if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE dose_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE medications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE patients;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. SEED DATA — Father & Mother medications
INSERT INTO patients (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Father'),
  ('22222222-2222-2222-2222-222222222222', 'Mother')
ON CONFLICT (id) DO NOTHING;

DELETE FROM medications WHERE patient_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

INSERT INTO medications (patient_id, name, dosage_per_take, time_of_day, current_stock, pack_size, daily_frequency, low_stock_threshold_days) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Telma H', 1, 'morning', 12, 30, 1, 5),
  ('11111111-1111-1111-1111-111111111111', 'Multivitamin Mens 50+', 1, 'morning', 0, 30, 1, 5),
  ('11111111-1111-1111-1111-111111111111', 'Voglibose', 1, 'morning', 125, 30, 2, 5),
  ('11111111-1111-1111-1111-111111111111', 'Tolkem SR 450', 1, 'morning', 10, 30, 1, 5),
  ('11111111-1111-1111-1111-111111111111', 'B12', 1, 'morning', 19, 30, 1, 5),
  ('11111111-1111-1111-1111-111111111111', 'Glycomet GP 1', 1, 'afternoon', 11, 30, 2, 5),
  ('11111111-1111-1111-1111-111111111111', 'Glycomet GP 1', 1, 'evening', 11, 30, 2, 5),
  ('11111111-1111-1111-1111-111111111111', 'Telma AM', 1, 'night', 23, 30, 1, 5),
  ('11111111-1111-1111-1111-111111111111', 'Voglibose', 1, 'night', 125, 30, 2, 5),
  ('11111111-1111-1111-1111-111111111111', 'Atorvastatin', 1, 'night', 26, 30, 1, 5),
  ('22222222-2222-2222-2222-222222222222', 'Telma AM', 1, 'morning', 33, 30, 1, 5),
  ('22222222-2222-2222-2222-222222222222', 'Metfine XL 50', 1, 'morning', 12, 30, 1, 5);

-- 7. DEDUPE + prevent future duplicates (safe to re-run)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY patient_id, name, time_of_day
    ORDER BY updated_at DESC NULLS LAST, id
  ) AS rn
  FROM medications
)
DELETE FROM medications WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS idx_medications_patient_name_slot
  ON medications (patient_id, name, time_of_day);

-- Done! Enable Email auth in: Authentication → Providers → Email
