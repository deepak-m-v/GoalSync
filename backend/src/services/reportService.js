const prisma = require('../lib/prisma');

function toCsv(rows, columns) {
  const header = columns.join(',');
  const lines = rows.map((row) =>
    columns.map((col) => {
      const val = row[col];
      if (val == null) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

async function plannedVsActualReport({ cycleId, departmentId }) {
  const checkIns = await prisma.checkIn.findMany({
    where: {
      goal: {
        ...(cycleId && { cycleId }),
        user: { ...(departmentId && { departmentId }) },
      },
    },
    include: {
      goal: {
        include: {
          user: { include: { department: true } },
        },
      },
    },
    orderBy: [{ goal: { userId: 'asc' } }, { quarter: 'asc' }],
  });

  const rows = checkIns.map((c) => ({
    employee: `${c.goal.user.firstName} ${c.goal.user.lastName}`,
    department: c.goal.user.department?.name || '',
    goal: c.goal.title,
    quarter: c.quarter,
    planned: c.plannedValue,
    actual: c.actualValue,
    progress_score: c.progressScore,
    status: c.progressStatus,
  }));

  return { rows, csv: toCsv(rows, ['employee', 'department', 'goal', 'quarter', 'planned', 'actual', 'progress_score', 'status']) };
}

async function employeeCompletionReport({ cycleId }) {
  const users = await prisma.user.findMany({
    where: { isActive: true, role: { name: 'employee' } },
    include: {
      goals: { where: cycleId ? { cycleId } : {} },
      department: true,
    },
  });

  const rows = users.map((u) => {
    const total = u.goals.length;
    const approved = u.goals.filter((g) => ['approved', 'locked'].includes(g.status)).length;
    return {
      employee: `${u.firstName} ${u.lastName}`,
      email: u.email,
      department: u.department?.name || '',
      total_goals: total,
      approved_goals: approved,
      completion_pct: total ? Math.round((approved / total) * 100) : 0,
    };
  });

  return { rows, csv: toCsv(rows, ['employee', 'email', 'department', 'total_goals', 'approved_goals', 'completion_pct']) };
}

async function quarterlySummaryReport(cycleId) {
  const summary = await prisma.checkIn.groupBy({
    by: ['quarter'],
    where: cycleId ? { goal: { cycleId } } : {},
    _count: { id: true },
    _avg: { progressScore: true },
  });

  const rows = summary.map((s) => ({
    quarter: s.quarter,
    check_in_count: s._count.id,
    avg_progress: s._avg.progressScore ? Number(s._avg.progressScore).toFixed(2) : 0,
  }));

  return { rows, csv: toCsv(rows, ['quarter', 'check_in_count', 'avg_progress']) };
}

module.exports = { plannedVsActualReport, employeeCompletionReport, quarterlySummaryReport, toCsv };
