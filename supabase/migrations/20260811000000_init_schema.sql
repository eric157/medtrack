-- MedTrack Database Migration Script

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Medications Table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  dosage_per_take INT DEFAULT 1,
  time_of_day VARCHAR(20) NOT NULL, -- 'morning', 'afternoon', 'evening', 'night'
  current_stock INT NOT NULL DEFAULT 0,
  pack_size INT NOT NULL DEFAULT 10,
  daily_frequency INT NOT NULL DEFAULT 1,
  low_stock_threshold_days INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Daily Dose Logs Table
CREATE TABLE IF NOT EXISTS dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_time_of_day VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'taken', 'skipped'
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Google Integration Tokens
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider VARCHAR(50) DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_patient ON dose_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_medication ON dose_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_logged_at ON dose_logs(logged_at DESC);

-- Automated Inventory Decrement Engine Function
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

-- Trigger Setup
DROP TRIGGER IF EXISTS trg_decrement_stock ON dose_logs;
CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON dose_logs
FOR EACH ROW
EXECUTE FUNCTION decrement_stock_on_dose_taken();

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Default permissive policies for demo/kiosk accessibility
CREATE POLICY "Allow public read access to patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow public write access to patients" ON patients FOR ALL USING (true);

CREATE POLICY "Allow public read access to medications" ON medications FOR SELECT USING (true);
CREATE POLICY "Allow public write access to medications" ON medications FOR ALL USING (true);

CREATE POLICY "Allow public read access to dose_logs" ON dose_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write access to dose_logs" ON dose_logs FOR ALL USING (true);

CREATE POLICY "Allow public access to user_integrations" ON user_integrations FOR ALL USING (true);

-- Enable Supabase Realtime publication for dose_logs and medications
ALTER PUBLICATION supabase_realtime ADD TABLE dose_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE medications;
