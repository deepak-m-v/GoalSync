const config = require('../config');

function buildDeepLink(path, params = {}) {
  const base = (config.escalation?.appUrl || config.corsOrigin || 'http://localhost:5173').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  ).toString();
  return qs ? `${base}${normalized}?${qs}` : `${base}${normalized}`;
}

const paths = {
  dashboard: () => buildDeepLink('/dashboard'),
  goals: () => buildDeepLink('/goals'),
  managerApprovals: (approvalId) =>
    buildDeepLink('/manager/approvals', approvalId ? { approvalId } : {}),
  managerCheckins: (userId, quarter) =>
    buildDeepLink('/manager/checkins', { userId, quarter }),
  escalations: () => buildDeepLink('/admin/escalations'),
  analytics: () => buildDeepLink('/admin/analytics'),
};

module.exports = { buildDeepLink, paths };
