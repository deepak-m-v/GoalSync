import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import ChartShell from './ChartShell';
import { CHART_COLORS, tooltipStyle } from './chartTheme';

export default function ManagerEffectivenessChart({ data = [] }) {
  const chartData = data.map((m) => ({
    name: m.name?.split(' ')[0] || m.name,
    approvalRate: m.approvalRate ?? 0,
    teamCompletion: m.teamCompletion ?? 0,
    avgReviewDays: m.avgReviewDays ?? 0,
    reviews: m.reviews ?? m.totalReviews ?? 0,
  }));

  return (
    <ChartShell title="Manager Effectiveness" subtitle="Approval rate, team completion, and review turnaround">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" unit="d" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Bar yAxisId="left" dataKey="approvalRate" name="Approval %" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} barSize={20} />
          <Bar yAxisId="left" dataKey="teamCompletion" name="Team Completion %" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="avgReviewDays" name="Avg Review (days)" stroke={CHART_COLORS[4]} strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
