-- Notification deduplication log (prevents duplicate SMS/email from cron retries)

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key VARCHAR(120) NOT NULL,
  recipient_key VARCHAR(20) NOT NULL,
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('sms', 'email')),
  event_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_key, recipient_key, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at DESC);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "caregiver_read_notification_log" ON notification_log
  FOR SELECT TO authenticated USING (true);

-- Service role (cron routes) bypasses RLS
