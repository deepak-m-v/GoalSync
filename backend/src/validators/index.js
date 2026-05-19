const { body, param, query } = require('express-validator');

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
];

const firebaseLoginRules = [body('idToken').notEmpty().isString()];

const refreshRules = [body('refreshToken').notEmpty().isString()];

const goalCreateRules = [
  body('cycleId').isInt({ min: 1 }),
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('uomType').isIn(['numeric', 'percentage', 'timeline', 'zero_based']),
  body('weightage').isFloat({ min: 10, max: 100 }),
  body('target').optional().isFloat(),
  body('timeline').optional().isISO8601(),
];

const goalUpdateRules = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().notEmpty(),
  body('weightage').optional().isFloat({ min: 10, max: 100 }),
];

const approvalReviewRules = [
  param('id').isInt({ min: 1 }),
  body('status').isIn(['approved', 'rejected']),
  body('comments').optional().isString(),
];

const sharedGoalRules = [
  body('cycleId').isInt({ min: 1 }),
  body('title').trim().notEmpty(),
  body('uomType').isIn(['numeric', 'percentage', 'timeline', 'zero_based']),
  body('target').optional().isFloat(),
];

const assignSharedRules = [
  param('id').isInt({ min: 1 }),
  body('assignments').isArray({ min: 1 }),
  body('assignments.*.userId').isInt({ min: 1 }),
  body('assignments.*.weightage').isFloat({ min: 10, max: 100 }),
];

const checkInRules = [
  param('goalId').isInt({ min: 1 }),
  body('quarter').isIn(['Q1', 'Q2', 'Q3', 'Q4']),
  body('progressStatus').optional().isIn(['not_started', 'on_track', 'completed']),
  body('plannedValue').optional().isFloat(),
  body('actualValue').optional().isFloat(),
];

module.exports = {
  loginRules,
  firebaseLoginRules,
  refreshRules,
  goalCreateRules,
  goalUpdateRules,
  approvalReviewRules,
  sharedGoalRules,
  assignSharedRules,
  checkInRules,
};
