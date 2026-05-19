const { LEVELS, LEVEL_ORDER, LOG_ACTIONS } = require('./constants');

function daysSince(date) {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000));
}

function mergeConfig(ruleConfig = {}) {
  return {
    managerEscalationDays: 3,
    hrEscalationDays: 7,
    maxRetries: 5,
    retryIntervalHours: 4,
    initialLevel: LEVELS.EMPLOYEE,
    ...ruleConfig,
  };
}

function getNextLevel(currentLevel) {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[idx + 1];
}

/**
 * Employee → Manager → HR escalation ladder.
 */
function resolveTargetLevel(escalation, config) {
  const cfg = mergeConfig(config);
  const ageDays = daysSince(escalation.createdAt);

  if (ageDays >= cfg.hrEscalationDays) return LEVELS.HR;
  if (ageDays >= cfg.managerEscalationDays && escalation.level !== LEVELS.HR) {
    return escalation.level === LEVELS.EMPLOYEE ? LEVELS.MANAGER : LEVELS.HR;
  }
  return escalation.level;
}

function shouldEscalateLevel(escalation, config) {
  const target = resolveTargetLevel(escalation, config);
  return target !== escalation.level;
}

function resolveAssignee({ level, employee, manager, hrAdmin }) {
  switch (level) {
    case LEVELS.EMPLOYEE:
      return { notifyUserId: employee.id, escalatedToId: manager?.id || null, assignedHrId: null };
    case LEVELS.MANAGER:
      return { notifyUserId: manager?.id || hrAdmin?.id, escalatedToId: manager?.id || null, assignedHrId: null };
    case LEVELS.HR:
      return { notifyUserId: hrAdmin?.id, escalatedToId: hrAdmin?.id, assignedHrId: hrAdmin?.id };
    default:
      return { notifyUserId: manager?.id, escalatedToId: manager?.id, assignedHrId: null };
  }
}

function buildNotificationCopy({ level, type, employeeName, reason, appUrl }) {
  const base = reason || 'Action required on GoalSync AI';
  const link = `${appUrl}/dashboard`;

  const titles = {
    [LEVELS.EMPLOYEE]: `Reminder: ${type.replace(/_/g, ' ')}`,
    [LEVELS.MANAGER]: `Escalation (Manager): ${employeeName}`,
    [LEVELS.HR]: `Escalation (HR): ${employeeName}`,
  };

  const messages = {
    [LEVELS.EMPLOYEE]: `Hi ${employeeName}, ${base}. Please complete your goals workflow: ${link}`,
    [LEVELS.MANAGER]: `Manager action needed for ${employeeName}: ${base}`,
    [LEVELS.HR]: `HR review required for ${employeeName}: ${base}`,
  };

  return {
    title: titles[level] || `Escalation: ${type}`,
    message: messages[level] || base,
    link,
  };
}

module.exports = {
  LEVELS,
  LOG_ACTIONS,
  mergeConfig,
  daysSince,
  getNextLevel,
  resolveTargetLevel,
  shouldEscalateLevel,
  resolveAssignee,
  buildNotificationCopy,
};
