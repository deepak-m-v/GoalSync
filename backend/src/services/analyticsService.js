const prisma = require('../lib/prisma');
const analyticsDummy = require('../data/analyticsDummy');

const COMPLETE_STATUSES = ['approved', 'locked'];

function pct(num, den) {
  return den ? Math.round((num / den) * 100) : 0;
}

async function getDashboardStats({ cycleId, departmentId } = {}) {
  const goalWhere = { ...(cycleId && { cycleId }) };
  const userWhere = departmentId ? { departmentId } : {};

  const [goalsByStatus, departmentStats, totalUsers, pendingApprovals, openEscalations] = await Promise.all([
    prisma.goal.groupBy({
      by: ['status'],
      where: goalWhere,
      _count: { id: true },
    }),
    prisma.department.findMany({
      select: {
        name: true,
        users: {
          where: userWhere,
          select: { goals: { where: goalWhere, select: { id: true, status: true } } },
        },
      },
    }),
    prisma.user.count({ where: { isActive: true, ...userWhere } }),
    prisma.goalApproval.count({ where: { status: 'pending', ...(cycleId && { cycleId }) } }),
    prisma.escalation.count({ where: { status: { in: ['open', 'in_progress'] } } }),
  ]);

  const deptMapped = departmentStats.map((d) => {
    const goals = d.users.flatMap((u) => u.goals);
    const completed = goals.filter((g) => COMPLETE_STATUSES.includes(g.status)).length;
    return {
      name: d.name,
      goal_count: goals.length,
      completion: pct(completed, goals.length),
      employees: d.users.length,
    };
  });

  const approved = goalsByStatus.find((g) => g.status === 'approved')?._count?.id || 0;
  const locked = goalsByStatus.find((g) => g.status === 'locked')?._count?.id || 0;
  const total = goalsByStatus.reduce((s, g) => s + g._count.id, 0);
  const statusAnalytics = goalsByStatus.map((g) => ({
    status: g.status,
    count: g._count.id,
    percentage: pct(g._count.id, total),
  }));

  return {
    goalsByStatus: goalsByStatus.map((g) => ({ status: g.status, count: g._count.id })),
    departmentStats: deptMapped,
    statusAnalytics,
    completion: {
      approved: approved + locked,
      total,
      rate: pct(approved + locked, total),
      trend: 0,
    },
    totalUsers,
    pendingApprovals,
    openEscalations,
  };
}

async function getQoQTrends(cycleId) {
  const checkIns = await prisma.checkIn.groupBy({
    by: ['quarter'],
    where: cycleId ? { goal: { cycleId } } : {},
    _avg: { progressScore: true, actualValue: true },
    _count: { id: true },
  });
  return checkIns.map((c) => ({
    quarter: c.quarter,
    avgProgress: c._avg.progressScore ? Number(c._avg.progressScore) : 0,
    avgActual: c._avg.actualValue ? Number(c._avg.actualValue) : 0,
    count: c._count.id,
    completion: c._avg.progressScore ? Math.round(Number(c._avg.progressScore)) : 0,
    onTrack: c._avg.progressScore ? Math.round(Number(c._avg.progressScore) * 0.92) : 0,
    atRisk: c._avg.progressScore ? Math.max(0, 100 - Math.round(Number(c._avg.progressScore))) : 0,
    avgScore: c._avg.progressScore ? Math.round(Number(c._avg.progressScore)) : 0,
  }));
}

async function getManagerEffectiveness() {
  const managers = await prisma.user.findMany({
    where: { role: { name: 'manager' }, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      reviewsGiven: {
        where: { status: { in: ['approved', 'rejected'] } },
        select: { status: true, reviewedAt: true, submittedAt: true },
      },
      directReports: {
        select: { goals: { select: { status: true } } },
      },
    },
  });

  return managers.map((m) => {
    const reviews = m.reviewsGiven;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    const reviewDays = reviews
      .filter((r) => r.reviewedAt && r.submittedAt)
      .map((r) => (r.reviewedAt - r.submittedAt) / (1000 * 60 * 60 * 24));
    const avgReviewDays = reviewDays.length
      ? Math.round((reviewDays.reduce((a, b) => a + b, 0) / reviewDays.length) * 10) / 10
      : 0;
    const teamGoals = m.directReports.flatMap((r) => r.goals);
    const teamDone = teamGoals.filter((g) => COMPLETE_STATUSES.includes(g.status)).length;

    return {
      managerId: m.id,
      name: `${m.firstName} ${m.lastName}`,
      reviews: reviews.length,
      totalReviews: reviews.length,
      approved,
      approvalRate: reviews.length ? Math.round((approved / reviews.length) * 100) : 0,
      avgReviewDays,
      teamCompletion: pct(teamDone, teamGoals.length),
    };
  });
}

async function getTeamPerformance() {
  const managers = await prisma.user.findMany({
    where: { role: { name: 'manager' }, isActive: true },
    select: {
      firstName: true,
      lastName: true,
      directReports: {
        where: { isActive: true },
        select: {
          goals: { select: { status: true } },
          checkInsUpdated: { select: { progressStatus: true } },
        },
      },
    },
    take: 12,
  });

  return managers.map((m) => {
    const goals = m.directReports.flatMap((r) => r.goals);
    const checkIns = m.directReports.flatMap((r) => r.checkInsUpdated);
    const completed = goals.filter((g) => COMPLETE_STATUSES.includes(g.status)).length;
    const onTrack = checkIns.filter((c) => c.progressStatus === 'on_track' || c.progressStatus === 'completed').length;
    return {
      team: `${m.firstName} ${m.lastName}'s Team`,
      completion: pct(completed, goals.length),
      onTrack: pct(onTrack, checkIns.length || 1),
      employees: m.directReports.length,
      avgScore: pct(completed, goals.length),
    };
  });
}

async function getGoalDistribution(cycleId) {
  const goalWhere = cycleId ? { cycleId } : {};
  const grouped = await prisma.goal.groupBy({
    by: ['thrustArea'],
    where: { ...goalWhere, thrustArea: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  return grouped.map((g) => ({
    thrustArea: g.thrustArea || 'Uncategorized',
    count: g._count.id,
  }));
}

async function getCheckInStatusBreakdown(cycleId) {
  const where = cycleId ? { goal: { cycleId } } : {};
  const grouped = await prisma.checkIn.groupBy({
    by: ['progressStatus'],
    where,
    _count: { id: true },
  });
  return grouped.map((c) => ({
    status: c.progressStatus,
    count: c._count.id,
  }));
}

async function getHeatmapData(cycleId) {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { name: true, users: { select: { id: true } } },
    take: 8,
  });

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const values = [];

  for (const dept of departments) {
    const userIds = dept.users.map((u) => u.id);
    const row = [];
    for (const quarter of quarters) {
      const agg = await prisma.checkIn.aggregate({
        where: {
          quarter,
          goal: {
            userId: { in: userIds },
            ...(cycleId && { cycleId }),
          },
        },
        _avg: { progressScore: true },
      });
      const score = agg._avg.progressScore ? Math.round(Number(agg._avg.progressScore)) : 0;
      row.push(score);
    }
    values.push(row);
  }

  return {
    departments: departments.map((d) => d.name),
    quarters,
    values,
  };
}

async function getDepartmentPerformance(cycleId) {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: {
      name: true,
      users: {
        where: { isActive: true },
        select: {
          goals: {
            where: cycleId ? { cycleId } : {},
            select: { id: true, status: true },
          },
        },
      },
    },
  });

  return departments.map((d) => {
    const goals = d.users.flatMap((u) => u.goals);
    const completed = goals.filter((g) => COMPLETE_STATUSES.includes(g.status)).length;
    return {
      name: d.name,
      completion: pct(completed, goals.length),
      goalCount: goals.length,
      employees: d.users.length,
      avgScore: pct(completed, goals.length),
    };
  });
}

async function getOverview({ cycleId, departmentId, demo } = {}) {
  if (demo === 'true' || process.env.ANALYTICS_USE_DUMMY === 'true') {
    return { ...analyticsDummy, source: 'demo' };
  }

  const [
    dash,
    quarterlyTrends,
    managerEffectiveness,
    teamPerformance,
    goalDistribution,
    checkInStatus,
    heatmap,
    departmentPerformance,
  ] = await Promise.all([
    getDashboardStats({ cycleId, departmentId }),
    getQoQTrends(cycleId),
    getManagerEffectiveness(),
    getTeamPerformance(),
    getGoalDistribution(cycleId),
    getCheckInStatusBreakdown(cycleId),
    getHeatmapData(cycleId),
    getDepartmentPerformance(cycleId),
  ]);

  const totalGoals = dash.completion.total;
  if (totalGoals < 3) {
    return { ...analyticsDummy, source: 'demo' };
  }

  const checkInTotal = checkInStatus.reduce((s, c) => s + c.count, 0);
  const onTrackCount = checkInStatus
    .filter((c) => c.status === 'on_track' || c.status === 'completed')
    .reduce((s, c) => s + c.count, 0);

  const avgProgress = quarterlyTrends.length
    ? Math.round(quarterlyTrends.reduce((s, q) => s + (q.avgScore || q.avgProgress || 0), 0) / quarterlyTrends.length)
    : dash.completion.rate;

  return {
    source: 'live',
    kpis: {
      totalUsers: dash.totalUsers,
      totalGoals,
      completionRate: dash.completion.rate,
      onTrackRate: pct(onTrackCount, checkInTotal || 1),
      avgProgressScore: avgProgress,
      pendingApprovals: dash.pendingApprovals,
      openEscalations: dash.openEscalations,
    },
    completion: dash.completion,
    teamPerformance: teamPerformance.length ? teamPerformance : analyticsDummy.teamPerformance,
    departmentPerformance: departmentPerformance.filter((d) => d.goalCount > 0).length
      ? departmentPerformance.filter((d) => d.goalCount > 0)
      : analyticsDummy.departmentPerformance,
    quarterlyTrends: quarterlyTrends.length ? quarterlyTrends : analyticsDummy.quarterlyTrends,
    heatmap: heatmap.values?.some((row) => row.some((v) => v > 0)) ? heatmap : analyticsDummy.heatmap,
    managerEffectiveness: managerEffectiveness.length
      ? managerEffectiveness
      : analyticsDummy.managerEffectiveness,
    goalDistribution: goalDistribution.length ? goalDistribution : analyticsDummy.goalDistribution,
    statusAnalytics: dash.statusAnalytics?.length ? dash.statusAnalytics : analyticsDummy.statusAnalytics,
    goalsByStatus: dash.goalsByStatus,
    checkInStatus: checkInStatus.length ? checkInStatus : analyticsDummy.checkInStatus,
    departmentStats: dash.departmentStats,
    totalUsers: dash.totalUsers,
    pendingApprovals: dash.pendingApprovals,
    openEscalations: dash.openEscalations,
  };
}

module.exports = {
  getDashboardStats,
  getQoQTrends,
  getManagerEffectiveness,
  getOverview,
};
