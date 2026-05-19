-- =============================================================================
-- GoalSync AI — PostgreSQL Schema (3NF, enterprise-ready)
-- Run: psql $DATABASE_URL -f database/schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- optional: fuzzy search on names/titles

-- -----------------------------------------------------------------------------
-- ENUM types (domain constraints at DB level)
-- -----------------------------------------------------------------------------
CREATE TYPE goal_uom_type AS ENUM ('numeric', 'percentage', 'timeline', 'zero_based');
CREATE TYPE goal_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'locked');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE quarter_code AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');
CREATE TYPE check_in_status AS ENUM ('not_started', 'on_track', 'completed');
CREATE TYPE escalation_status AS ENUM ('open', 'in_progress', 'resolved', 'dismissed');
CREATE TYPE escalation_type AS ENUM (
  'goal_not_submitted',
  'approval_pending',
  'check_in_overdue',
  'other'
);
CREATE TYPE notification_type AS ENUM (
  'goal_approval',
  'check_in_reminder',
  'escalation',
  'system',
  'unlock'
);
CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'submit', 'approve', 'reject', 'unlock', 'check_in'
);

-- -----------------------------------------------------------------------------
-- Utility: auto-update updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. ROLES (reference — who can do what in the app)
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
  id          SMALLSERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,  -- employee | manager | admin
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE roles IS 'Application roles for RBAC; referenced by users.role_id';

-- -----------------------------------------------------------------------------
-- 2. DEPARTMENTS (organizational unit)
-- -----------------------------------------------------------------------------
CREATE TABLE departments (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  code        VARCHAR(20) UNIQUE,
  parent_id   INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_parent ON departments(parent_id) WHERE parent_id IS NOT NULL;

COMMENT ON TABLE departments IS 'Org structure; supports optional parent for sub-departments';

-- -----------------------------------------------------------------------------
-- 3. PERFORMANCE CYCLES (fiscal / review period — scopes goals & approvals)
-- -----------------------------------------------------------------------------
CREATE TABLE performance_cycles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  year        SMALLINT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL CHECK (end_date > start_date),
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_performance_cycles_year_name UNIQUE (year, name)
);

-- Only one active cycle at a time
CREATE UNIQUE INDEX uq_performance_cycles_active
  ON performance_cycles ((TRUE))
  WHERE is_active = TRUE;

-- -----------------------------------------------------------------------------
-- 4. USERS (employees, managers, admins + hierarchy)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  uuid            UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  role_id         SMALLINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  department_id   INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  manager_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  employee_code   VARCHAR(50),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_not_self_manager CHECK (manager_id IS NULL OR manager_id <> id)
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_department_id ON users(department_id) WHERE department_id IS NOT NULL;
CREATE INDEX idx_users_manager_id ON users(manager_id) WHERE manager_id IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_name_trgm ON users USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

COMMENT ON COLUMN users.manager_id IS 'Reports-to relationship; enables manager team queries';

-- -----------------------------------------------------------------------------
-- 5. SHARED GOALS (org-wide KPI templates assigned by managers/admins)
-- -----------------------------------------------------------------------------
CREATE TABLE shared_goals (
  id            SERIAL PRIMARY KEY,
  cycle_id      INTEGER NOT NULL REFERENCES performance_cycles(id) ON DELETE RESTRICT,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  thrust_area   VARCHAR(100),
  uom_type      goal_uom_type NOT NULL,
  target        DECIMAL(15, 4),
  created_by    INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shared_goals_cycle ON shared_goals(cycle_id);
CREATE INDEX idx_shared_goals_created_by ON shared_goals(created_by);

CREATE TRIGGER shared_goals_updated_at
  BEFORE UPDATE ON shared_goals
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. GOALS (employee-owned objectives; may link to a shared goal template)
-- -----------------------------------------------------------------------------
CREATE TABLE goals (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id        INTEGER NOT NULL REFERENCES performance_cycles(id) ON DELETE RESTRICT,
  shared_goal_id  INTEGER REFERENCES shared_goals(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  thrust_area     VARCHAR(100),
  uom_type        goal_uom_type NOT NULL,
  target          DECIMAL(15, 4),
  weightage       DECIMAL(5, 2) NOT NULL
                    CHECK (weightage >= 10 AND weightage <= 100),
  timeline        DATE,
  status          goal_status NOT NULL DEFAULT 'draft',
  is_shared       BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked       BOOLEAN NOT NULL DEFAULT FALSE,
  locked_at       TIMESTAMPTZ,
  locked_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_goals_shared_flag
    CHECK (
      (is_shared = FALSE AND shared_goal_id IS NULL)
      OR (is_shared = TRUE AND shared_goal_id IS NOT NULL)
    )
);

CREATE INDEX idx_goals_user_cycle ON goals(user_id, cycle_id);
CREATE INDEX idx_goals_cycle_status ON goals(cycle_id, status);
CREATE INDEX idx_goals_shared_goal ON goals(shared_goal_id) WHERE shared_goal_id IS NOT NULL;
CREATE INDEX idx_goals_user_draft ON goals(user_id) WHERE status = 'draft';

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. SHARED GOAL ASSIGNMENTS (maps template → employees + weightage)
-- -----------------------------------------------------------------------------
CREATE TABLE shared_goal_assignments (
  id              SERIAL PRIMARY KEY,
  shared_goal_id  INTEGER NOT NULL REFERENCES shared_goals(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id         INTEGER UNIQUE REFERENCES goals(id) ON DELETE SET NULL,
  weightage       DECIMAL(5, 2) NOT NULL CHECK (weightage >= 10 AND weightage <= 100),
  assigned_by     INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_shared_goal_assignments_user UNIQUE (shared_goal_id, user_id)
);

CREATE INDEX idx_sga_user ON shared_goal_assignments(user_id);
CREATE INDEX idx_sga_shared_goal ON shared_goal_assignments(shared_goal_id);

-- -----------------------------------------------------------------------------
-- 8. GOAL APPROVALS (one submission workflow record per employee per cycle)
-- -----------------------------------------------------------------------------
CREATE TABLE goal_approvals (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id      INTEGER NOT NULL REFERENCES performance_cycles(id) ON DELETE RESTRICT,
  status        approval_status NOT NULL DEFAULT 'pending',
  reviewer_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  comments      TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_goal_approvals_user_cycle UNIQUE (user_id, cycle_id)
);

CREATE INDEX idx_goal_approvals_reviewer_status
  ON goal_approvals(reviewer_id, status)
  WHERE status = 'pending';
CREATE INDEX idx_goal_approvals_cycle_status ON goal_approvals(cycle_id, status);

CREATE TRIGGER goal_approvals_updated_at
  BEFORE UPDATE ON goal_approvals
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- -----------------------------------------------------------------------------
-- 9. QUARTERLY CHECK-INS (planned vs actual per goal per quarter)
-- -----------------------------------------------------------------------------
CREATE TABLE check_ins (
  id                SERIAL PRIMARY KEY,
  goal_id           INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  quarter           quarter_code NOT NULL,
  planned_value     DECIMAL(15, 4),
  actual_value      DECIMAL(15, 4),
  progress_status   check_in_status NOT NULL DEFAULT 'not_started',
  completion_date   DATE,
  progress_score    DECIMAL(5, 2) CHECK (progress_score IS NULL OR (progress_score >= 0 AND progress_score <= 100)),
  employee_notes    TEXT,
  manager_comments  TEXT,
  updated_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_check_ins_goal_quarter UNIQUE (goal_id, quarter)
);

CREATE INDEX idx_check_ins_goal ON check_ins(goal_id);
CREATE INDEX idx_check_ins_status ON check_ins(progress_status);
CREATE INDEX idx_check_ins_quarter ON check_ins(quarter);

CREATE TRIGGER check_ins_updated_at
  BEFORE UPDATE ON check_ins
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- -----------------------------------------------------------------------------
-- 10. ACHIEVEMENT LOGS (immutable history of value changes)
-- -----------------------------------------------------------------------------
CREATE TABLE achievement_logs (
  id              BIGSERIAL PRIMARY KEY,
  goal_id         INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  check_in_id     INTEGER REFERENCES check_ins(id) ON DELETE SET NULL,
  field_changed   VARCHAR(50) NOT NULL DEFAULT 'actual_value',
  previous_value  DECIMAL(15, 4),
  new_value       DECIMAL(15, 4),
  changed_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_achievement_logs_goal ON achievement_logs(goal_id, created_at DESC);
CREATE INDEX idx_achievement_logs_check_in ON achievement_logs(check_in_id) WHERE check_in_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 11. AUDIT LOGS (compliance trail — never cascade-delete)
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entity_type   VARCHAR(50) NOT NULL,
  entity_id     INTEGER,
  action        audit_action NOT NULL,
  old_values    JSONB,
  new_values    JSONB,
  metadata      JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_created_brin ON audit_logs USING brin(created_at);
CREATE INDEX idx_audit_logs_new_values_gin ON audit_logs USING gin(new_values jsonb_path_ops);

-- -----------------------------------------------------------------------------
-- 12. NOTIFICATIONS (in-app alerts)
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  message     TEXT,
  type        notification_type NOT NULL DEFAULT 'system',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  link        VARCHAR(500),
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;

-- -----------------------------------------------------------------------------
-- 13. ESCALATIONS (Employee → Manager → HR workflow)
-- -----------------------------------------------------------------------------
CREATE TABLE escalations (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  escalated_to    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_hr_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cycle_id        INTEGER REFERENCES performance_cycles(id) ON DELETE SET NULL,
  type            escalation_type NOT NULL,
  reason          TEXT,
  status          escalation_status NOT NULL DEFAULT 'open',
  resolved_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escalations_status ON escalations(status) WHERE status IN ('open', 'in_progress');
CREATE INDEX idx_escalations_escalated_to ON escalations(escalated_to, status);
CREATE INDEX idx_escalations_user ON escalations(user_id);

CREATE TRIGGER escalations_updated_at
  BEFORE UPDATE ON escalations
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- -----------------------------------------------------------------------------
-- Views (common read patterns)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_hierarchy AS
SELECT
  e.id AS employee_id,
  e.email AS employee_email,
  e.first_name || ' ' || e.last_name AS employee_name,
  m.id AS manager_id,
  m.email AS manager_email,
  d.name AS department_name,
  r.name AS role_name
FROM users e
JOIN roles r ON r.id = e.role_id
LEFT JOIN users m ON m.id = e.manager_id
LEFT JOIN departments d ON d.id = e.department_id
WHERE e.is_active = TRUE;

CREATE OR REPLACE VIEW v_goal_sheet_summary AS
SELECT
  g.user_id,
  g.cycle_id,
  COUNT(*)::int AS goal_count,
  SUM(g.weightage) AS total_weightage,
  BOOL_AND(g.status IN ('approved', 'locked')) AS all_approved
FROM goals g
GROUP BY g.user_id, g.cycle_id;
