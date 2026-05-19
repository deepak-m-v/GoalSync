import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import ChartShell from './ChartShell';
import { STATUS_COLORS, formatStatus, tooltipStyle } from './chartTheme';

export default function StatusAnalyticsChart({ statusAnalytics = [], checkInStatus = [] }) {
  const goalStatus = statusAnalytics.map((s) => ({
    name: formatStatus(s.status),
    count: s.count,
    percentage: s.percentage,
    key: s.status,
  }));

  const checkIn = checkInStatus.map((s) => ({
    name: formatStatus(s.status),
    count: s.count,
    key: s.status,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartShell title="Goal Status Analytics" subtitle="Distribution across workflow states">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={goalStatus}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, _, p) => [`${v} (${p.payload.percentage ?? 0}%)`, 'Goals']} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {goalStatus.map((entry) => (
                <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Check-in Status" subtitle="Quarterly progress status breakdown">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={checkIn}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {checkIn.map((entry) => (
                <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  );
}
