-- GoalSync AI — Seed Data

INSERT INTO roles (name, description) VALUES
  ('admin', 'HR / System Administrator'),
  ('manager', 'Team Manager'),
  ('employee', 'Individual Contributor');

INSERT INTO departments (name, code) VALUES
  ('Engineering', 'ENG'),
  ('Human Resources', 'HR'),
  ('Sales', 'SALES'),
  ('Operations', 'OPS');

INSERT INTO performance_cycles (name, year, start_date, end_date, is_active) VALUES
  ('FY 2026', 2026, '2026-01-01', '2026-12-31', TRUE);

-- Password for all demo users: Password123
INSERT INTO users (email, password_hash, first_name, last_name, role_id, department_id, manager_id) VALUES
  ('admin@goalsync.com', '$2b$10$bZ9yzS4hpmyxbqPtU7E27.KzBHhr8rRTL/9dz9u7E1IvDMMVzKnUu', 'Alex', 'Admin', 1, 2, NULL),
  ('manager@goalsync.com', '$2b$10$bZ9yzS4hpmyxbqPtU7E27.KzBHhr8rRTL/9dz9u7E1IvDMMVzKnUu', 'Morgan', 'Manager', 2, 1, NULL),
  ('employee@goalsync.com', '$2b$10$bZ9yzS4hpmyxbqPtU7E27.KzBHhr8rRTL/9dz9u7E1IvDMMVzKnUu', 'Jamie', 'Employee', 3, 1, 2);
