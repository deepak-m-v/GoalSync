import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import ChartShell from './ChartShell';
import { CHART_COLORS, tooltipStyle } from './chartTheme';

export default function TeamPerformanceChart({ data = [] }) {
  return (
    <ChartShell title="Team Performance" subtitle="Completion vs on-track by manager team">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="team" tick={{ fontSize: 10 }} angle={-28} textAnchor="end" height={70} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, '']} />
          <Legend />
          <Bar dataKey="completion" name="Completion %" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
          <Bar dataKey="onTrack" name="On Track %" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
