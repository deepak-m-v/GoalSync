-- GoalSync AI — Escalation engine: rules, logs, email queue, escalation levels
-- Run after schema.sql: psql $DATABASE_URL -f database/migrations/002_escalation_engine.sql

CREATE TYPE escalation_level AS ENUM ('employee', 'manager', 'hr');
CREATE TYPE email_queue_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE escalation_rules (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  description TEXT,
  is_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  config      JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER escalation_rules_updated_at
  BEFORE UPDATE ON escalation_rules
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

ALTER TABLE escalations
  ADD COLUMN IF NOT EXISTS rule_id INTEGER REFERENCES escalation_rules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS level escalation_level NOT NULL DEFAULT 'employee',
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_escalations_level ON escalations(level, status)
  WHERE status IN ('open', 'in_progress');

CREATE TABLE escalation_logs (
  id             BIGSERIAL PRIMARY KEY,
  escalation_id  INTEGER NOT NULL REFERENCES escalations(id) ON DELETE CASCADE,
  rule_id        INTEGER REFERENCES escalation_rules(id) ON DELETE SET NULL,
  action         VARCHAR(50) NOT NULL,
  level          escalation_level,
  message        TEXT,
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escalation_logs_escalation ON escalation_logs(escalation_id, created_at DESC);

CREATE TABLE email_queue (
  id             BIGSERIAL PRIMARY KEY,
  escalation_id  INTEGER REFERENCES escalations(id) ON DELETE SET NULL,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_email       VARCHAR(255) NOT NULL,
  subject        VARCHAR(255) NOT NULL,
  body           TEXT NOT NULL,
  status         email_queue_status NOT NULL DEFAULT 'pending',
  attempts       INTEGER NOT NULL DEFAULT 0,
  max_attempts   INTEGER NOT NULL DEFAULT 3,
  last_error     TEXT,
  scheduled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_queue_pending ON email_queue(status, scheduled_at)
  WHERE status = 'pending';

INSERT INTO escalation_rules (code, name, description, config) VALUES
  (
    'goal_not_submitted',
    'Goals Not Submitted',
    'Employee has not submitted goals for the active performance cycle',
    '{"managerEscalationDays":3,"hrEscalationDays":7,"maxRetries":5,"retryIntervalHours":4,"initialLevel":"employee"}'::jsonb
  ),
  (
    'approval_pending',
    'Manager Approval Pending',
    'Manager has not approved submitted goals within the threshold',
    '{"managerEscalationDays":5,"hrEscalationDays":10,"maxRetries":5,"retryIntervalHours":4,"initialLevel":"manager"}'::jsonb
  ),
  (
    'check_in_overdue',
    'Quarterly Check-in Overdue',
    'Employee quarterly check-in is missing or overdue',
    '{"managerEscalationDays":3,"hrEscalationDays":7,"maxRetries":5,"retryIntervalHours":4,"checkInGraceDays":14,"initialLevel":"employee"}'::jsonb
  )
ON CONFLICT (code) DO NOTHING;
