const { paths } = require('../../lib/deepLinks');

/**
 * Adaptive Card v1.5 — manager approval alert (Teams incoming webhook).
 */
function buildManagerApprovalCard({
  employeeName,
  employeeEmail,
  goalCount,
  cycleName,
  approvalId,
  submittedAt,
}) {
  const reviewUrl = paths.managerApprovals(approvalId);
  const submitted = submittedAt
    ? new Date(submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Just now';

  return {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: 'Goal Approval Required',
        weight: 'Bolder',
        size: 'Large',
        color: 'Accent',
      },
      {
        type: 'TextBlock',
        text: `${employeeName} submitted a goal sheet for your review.`,
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Employee', value: employeeName },
          { title: 'Email', value: employeeEmail || '—' },
          { title: 'Cycle', value: cycleName || 'Active cycle' },
          { title: 'Goals', value: String(goalCount ?? 0) },
          { title: 'Submitted', value: submitted },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'Review in GoalSync',
        url: reviewUrl,
        style: 'positive',
      },
      {
        type: 'Action.OpenUrl',
        title: 'Team dashboard',
        url: paths.dashboard(),
      },
    ],
    msteams: {
      width: 'Full',
    },
  };
}

module.exports = { buildManagerApprovalCard };
