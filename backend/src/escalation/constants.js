const RULE_CODES = {
  GOAL_NOT_SUBMITTED: 'goal_not_submitted',
  APPROVAL_PENDING: 'approval_pending',
  CHECK_IN_OVERDUE: 'check_in_overdue',
};

const LEVELS = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR: 'hr',
};

const LEVEL_ORDER = [LEVELS.EMPLOYEE, LEVELS.MANAGER, LEVELS.HR];

const DEFAULT_RULE_CONFIG = {
  managerEscalationDays: 3,
  hrEscalationDays: 7,
  maxRetries: 5,
  retryIntervalHours: 4,
  checkInGraceDays: 14,
  initialLevel: LEVELS.EMPLOYEE,
};

const LOG_ACTIONS = {
  CREATED: 'created',
  NOTIFIED: 'notified',
  ESCALATED: 'escalated',
  RETRY: 'retry',
  RESOLVED: 'resolved',
  EMAIL_QUEUED: 'email_queued',
  EMAIL_SENT: 'email_sent',
  EMAIL_FAILED: 'email_failed',
};

module.exports = {
  RULE_CODES,
  LEVELS,
  LEVEL_ORDER,
  DEFAULT_RULE_CONFIG,
  LOG_ACTIONS,
};
