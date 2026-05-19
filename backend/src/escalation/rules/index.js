const { RULE_CODES } = require('../constants');
const goalNotSubmitted = require('./goalNotSubmitted');
const approvalPending = require('./approvalPending');
const checkInOverdue = require('./checkInOverdue');

const RULE_HANDLERS = {
  [RULE_CODES.GOAL_NOT_SUBMITTED]: goalNotSubmitted,
  [RULE_CODES.APPROVAL_PENDING]: approvalPending,
  [RULE_CODES.CHECK_IN_OVERDUE]: checkInOverdue,
};

const TYPE_BY_CODE = {
  [RULE_CODES.GOAL_NOT_SUBMITTED]: 'goal_not_submitted',
  [RULE_CODES.APPROVAL_PENDING]: 'approval_pending',
  [RULE_CODES.CHECK_IN_OVERDUE]: 'check_in_overdue',
};

module.exports = { RULE_HANDLERS, TYPE_BY_CODE };
