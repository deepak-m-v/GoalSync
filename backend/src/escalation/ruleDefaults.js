const { RULE_CODES, DEFAULT_RULE_CONFIG, LEVELS } = require('./constants');

const DEFAULT_RULES = [
  {
    code: RULE_CODES.GOAL_NOT_SUBMITTED,
    name: 'Goals Not Submitted',
    description: 'Employee has not submitted goals for the active performance cycle',
    config: {
      ...DEFAULT_RULE_CONFIG,
      initialLevel: LEVELS.EMPLOYEE,
      managerEscalationDays: 3,
      hrEscalationDays: 7,
    },
  },
  {
    code: RULE_CODES.APPROVAL_PENDING,
    name: 'Manager Approval Pending',
    description: 'Manager has not approved submitted goals within the threshold',
    config: {
      ...DEFAULT_RULE_CONFIG,
      initialLevel: LEVELS.MANAGER,
      managerEscalationDays: 5,
      hrEscalationDays: 10,
    },
  },
  {
    code: RULE_CODES.CHECK_IN_OVERDUE,
    name: 'Quarterly Check-in Overdue',
    description: 'Employee quarterly check-in is missing or overdue',
    config: {
      ...DEFAULT_RULE_CONFIG,
      initialLevel: LEVELS.EMPLOYEE,
      checkInGraceDays: 14,
    },
  },
];

module.exports = { DEFAULT_RULES };
