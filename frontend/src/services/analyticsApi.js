import api from '../api/client';
import { analyticsDummy } from '../data/analyticsDummy';

function mergeWithDummy(live) {
  if (!live || live.source === 'demo') return live || analyticsDummy;
  const sparse =
    !live.teamPerformance?.length ||
    !live.heatmap?.values?.length ||
    !live.managerEffectiveness?.length;
  if (sparse) {
    return {
      ...analyticsDummy,
      ...live,
      source: 'mixed',
      kpis: { ...analyticsDummy.kpis, ...live.kpis },
      completion: { ...analyticsDummy.completion, ...live.completion },
    };
  }
  return live;
}

export async function fetchAnalyticsOverview(params = {}) {
  try {
    const { data } = await api.get('/analytics/overview', { params });
    return mergeWithDummy(data.data);
  } catch {
    try {
      const { data } = await api.get('/admin/analytics/overview', { params });
      return mergeWithDummy(data.data);
    } catch {
      return { ...analyticsDummy, source: 'demo' };
    }
  }
}

export async function fetchQoQTrends(cycleId) {
  try {
    const { data } = await api.get('/analytics/qoq', { params: cycleId ? { cycleId } : {} });
    return data.data;
  } catch {
    return analyticsDummy.quarterlyTrends.map((q) => ({
      quarter: q.quarter,
      avgProgress: q.avgScore,
    }));
  }
}

export async function fetchManagerEffectiveness() {
  try {
    const { data } = await api.get('/analytics/managers');
    return data.data?.length ? data.data : analyticsDummy.managerEffectiveness;
  } catch {
    return analyticsDummy.managerEffectiveness;
  }
}
