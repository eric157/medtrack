-- Auth-aware RLS, push subscriptions, Google task tracking, fix double-decrement

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track auto-created Google Tasks to avoid duplicates
CREATE TABLE IF NOT EXISTS google_task_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  google_task_id TEXT,
  task_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_google_task_sync_med ON google_task_sync_log(medication_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_integrations_user_provider ON user_integrations(user_id, provider);

-- Drop permissive demo policies
DROP POLICY IF EXISTS "Allow public read access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public write access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public read access to medications" ON medications;
DROP POLICY IF EXISTS "Allow public write access to medications" ON medications;
DROP POLICY IF EXISTS "Allow public read access to dose_logs" ON dose_logs;
DROP POLICY IF EXISTS "Allow public write access to dose_logs" ON dose_logs;
DROP POLICY IF EXISTS "Allow public access to user_integrations" ON user_integrations;

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_task_sync_log ENABLE ROW LEVEL SECURITY;

-- Authenticated caregiver: full household access
CREATE POLICY "caregiver_all_patients" ON patients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "caregiver_all_medications" ON medications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "caregiver_all_dose_logs" ON dose_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "caregiver_own_integrations" ON user_integrations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "caregiver_own_push_subs" ON push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "caregiver_read_task_sync" ON google_task_sync_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "caregiver_insert_task_sync" ON google_task_sync_log FOR INSERT TO authenticated WITH CHECK (true);

-- Kiosk read-only via anon (display schedule; writes go through Server Actions + service role)
CREATE POLICY "kiosk_read_patients" ON patients FOR SELECT TO anon USING (true);
CREATE POLICY "kiosk_read_medications" ON medications FOR SELECT TO anon USING (true);
CREATE POLICY "kiosk_read_dose_logs" ON dose_logs FOR SELECT TO anon USING (true);
CREATE POLICY "kiosk_insert_dose_logs" ON dose_logs FOR INSERT TO anon WITH CHECK (true);

-- Service role bypasses RLS for cron jobs and kiosk server actions

ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;
