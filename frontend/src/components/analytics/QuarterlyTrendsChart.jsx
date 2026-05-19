import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import ChartShell from './ChartShell';
import { CHART_COLORS, tooltipStyle } from './chartTheme';

export default function QuarterlyTrendsChart({ data = [] }) {
  const chartData = data.map((q) => ({
    name: q.quarter || q.name,
    completion: q.completion ?? q.avgScore ?? q.avgProgress ?? 0,
    onTrack: q.onTrack ?? Math.round((q.completion ?? q.avgScore ?? 0) * 0.92),
    atRisk: q.atRisk ?? Math.max(0, 100 - (q.completion ?? q.avgScore ?? 0)),
    avgScore: q.avgScore ?? q.avgProgress ?? q.completion ?? 0,
  }));

  return (
    <ChartShell title="Quarterly Trends" subtitle="Completion, on-track, and at-risk over fiscal quarters">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, '']} />
          <Legend />
          <Line type="monotone" dataKey="completion" name="Completion" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="onTrack" name="On Track" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="atRisk" name="At Risk" stroke={CHART_COLORS[4]} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
