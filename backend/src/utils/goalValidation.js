const MAX_GOALS = 8;
const MIN_WEIGHTAGE = 10;
const TOTAL_WEIGHTAGE = 100;

function validateGoalSheet(goals) {
  const errors = [];

  if (!goals || goals.length === 0) {
    return { valid: false, errors: ['At least one goal is required.'] };
  }

  if (goals.length > MAX_GOALS) {
    errors.push(`Maximum ${MAX_GOALS} goals allowed per employee.`);
  }

  const totalWeight = goals.reduce((sum, g) => sum + parseFloat(g.weightage || 0), 0);
  if (Math.abs(totalWeight - TOTAL_WEIGHTAGE) > 0.01) {
    errors.push(`Total weightage must equal ${TOTAL_WEIGHTAGE}% (current: ${totalWeight}%).`);
  }

  goals.forEach((g, i) => {
    const w = parseFloat(g.weightage);
    if (w < MIN_WEIGHTAGE) {
      errors.push(`Goal ${i + 1}: minimum weightage is ${MIN_WEIGHTAGE}%.`);
    }
    if (!g.title?.trim()) {
      errors.push(`Goal ${i + 1}: title is required.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

module.exports = { validateGoalSheet, MAX_GOALS, MIN_WEIGHTAGE, TOTAL_WEIGHTAGE };
