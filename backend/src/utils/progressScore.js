/**
 * Progress score engine per CLAUDE.md spec
 */
function calculateProgressScore(uomType, target, achievement, completionDate, deadline) {
  const t = parseFloat(target);
  const a = parseFloat(achievement);

  if (uomType === 'zero_based') {
    return a === 0 ? 100 : 0;
  }

  if (uomType === 'timeline') {
    if (!completionDate || !deadline) return 0;
    const completed = new Date(completionDate);
    const due = new Date(deadline);
    return completed <= due ? 100 : Math.max(0, 100 - Math.ceil((completed - due) / (86400000 * 7)) * 5);
  }

  if (!t || t === 0) return 0;

  if (uomType === 'numeric' || uomType === 'percentage') {
    const ratio = a / t;
    return Math.min(100, Math.round(ratio * 100));
  }

  // max type (lower is better) — inverse ratio
  if (a === 0) return 100;
  const maxRatio = t / a;
  return Math.min(100, Math.round(maxRatio * 100));
}

module.exports = { calculateProgressScore };
