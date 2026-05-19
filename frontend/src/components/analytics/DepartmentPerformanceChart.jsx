import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import ChartShell from './ChartShell';
import { CHART_COLORS, tooltipStyle } from './chartTheme';

export default function DepartmentPerformanceChart({ data = [] }) {
  const sorted = [...data].sort((a, b) => (b.completion ?? 0) - (a.completion ?? 0));

  return (
    <ChartShell title="Department Performance" subtitle="Goal completion rate by department">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => (name === 'completion' ? [`${v}%`, 'Completion'] : [v, name])}
          />
          <Bar dataKey="completion" name="Completion %" radius={[0, 8, 8, 0]} barSize={18}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
