-- Real Inventory Seed Data for MedTrack

-- Insert Patients
INSERT INTO patients (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Father'),
  ('22222222-2222-2222-2222-222222222222', 'Mother')
ON CONFLICT (id) DO NOTHING;

-- Insert Real Medications & Stock for Father
INSERT INTO medications (patient_id, name, dosage_per_take, time_of_day, current_stock, pack_size, daily_frequency, low_stock_threshold_days) VALUES
  -- Father - Morning
  ('11111111-1111-1111-1111-111111111111', 'Telma H', 1, 'morning', 12, 30, 1, 15),
  ('11111111-1111-1111-1111-111111111111', 'Multivitamin Mens 50+', 1, 'morning', 0, 30, 1, 15), -- Depleted (0 days)
  ('11111111-1111-1111-1111-111111111111', 'Voglibose', 1, 'morning', 125, 30, 2, 15),
  ('11111111-1111-1111-1111-111111111111', 'Tolkem SR 450', 1, 'morning', 10, 30, 1, 15),
  ('11111111-1111-1111-1111-111111111111', 'B12', 1, 'morning', 19, 30, 1, 15),

  -- Father - Afternoon
  ('11111111-1111-1111-1111-111111111111', 'Glycomet GP 1', 1, 'afternoon', 11, 30, 2, 15), -- Critically low (5.5 days)

  -- Father - Evening
  ('11111111-1111-1111-1111-111111111111', 'Glycomet GP 1', 1, 'evening', 11, 30, 2, 15),

  -- Father - Night
  ('11111111-1111-1111-1111-111111111111', 'Telma AM', 1, 'night', 23, 30, 1, 15),
  ('11111111-1111-1111-1111-111111111111', 'Voglibose', 1, 'night', 125, 30, 2, 15),
  ('11111111-1111-1111-1111-111111111111', 'Atorvastatin', 1, 'night', 26, 30, 1, 15);

-- Insert Real Medications & Stock for Mother
INSERT INTO medications (patient_id, name, dosage_per_take, time_of_day, current_stock, pack_size, daily_frequency, low_stock_threshold_days) VALUES
  -- Mother - Morning
  ('22222222-2222-2222-2222-222222222222', 'Telma AM', 1, 'morning', 33, 30, 1, 15),
  ('22222222-2222-2222-2222-222222222222', 'Metfine XL 50', 1, 'morning', 12, 30, 1, 15);
