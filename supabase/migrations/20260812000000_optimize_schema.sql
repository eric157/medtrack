-- Schema optimizations: indexes, stock sync trigger, constraints, safe realtime

-- Composite index for per-medication daily log lookups (auto-taken + kiosk)
CREATE INDEX IF NOT EXISTS idx_dose_logs_med_logged_at
  ON dose_logs (medication_id, logged_at DESC);

-- Partial index for active medication queries
CREATE INDEX IF NOT EXISTS idx_medications_active
  ON medications (patient_id, time_of_day)
  WHERE is_active = true;

-- Status / time slot validation
DO $$ BEGIN
  ALTER TABLE dose_logs
    ADD CONSTRAINT dose_logs_status_check
    CHECK (status IN ('taken', 'skipped', 'missed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE medications
    ADD CONSTRAINT medications_time_of_day_check
    CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE dose_logs
    ADD CONSTRAINT dose_logs_time_of_day_check
    CHECK (scheduled_time_of_day IN ('morning', 'afternoon', 'evening', 'night'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sync stock across all schedule slots for the same medication name (shared bottle)
CREATE OR REPLACE FUNCTION decrement_stock_on_dose_taken()
RETURNS TRIGGER AS $$
DECLARE
  med_name VARCHAR(100);
  med_patient_id UUID;
  med_dosage INT;
  new_stock INT;
BEGIN
  IF NEW.status = 'taken' THEN
    SELECT m.name, m.patient_id, m.dosage_per_take, m.current_stock
    INTO med_name, med_patient_id, med_dosage, new_stock
    FROM medications m
    WHERE m.id = NEW.medication_id;

    new_stock := GREATEST(0, new_stock - med_dosage);

    UPDATE medications
    SET current_stock = new_stock,
        updated_at = NOW()
    WHERE patient_id = med_patient_id
      AND name = med_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_stock ON dose_logs;
CREATE TRIGGER trg_decrement_stock
  AFTER INSERT ON dose_logs
  FOR EACH ROW
  EXECUTE FUNCTION decrement_stock_on_dose_taken();

-- Safe realtime publication (idempotent)
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

-- Ensure user_integrations references auth.users
DO $$ BEGIN
  ALTER TABLE user_integrations
    ADD CONSTRAINT user_integrations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
