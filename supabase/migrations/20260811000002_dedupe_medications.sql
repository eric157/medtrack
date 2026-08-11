-- Remove duplicate medication rows (caused by re-running seed.sql without DELETE)
-- Keeps the most recently updated row per patient + name + time slot.

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY patient_id, name, time_of_day
      ORDER BY updated_at DESC NULLS LAST, id
    ) AS rn
  FROM medications
)
DELETE FROM medications
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS idx_medications_patient_name_slot
  ON medications (patient_id, name, time_of_day);
