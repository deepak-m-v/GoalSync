import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartShell from './ChartShell';
import { CHART_COLORS, tooltipStyle } from './chartTheme';

export default function GoalDistributionChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.thrustArea || d.name,
    value: d.count ?? d.value ?? 0,
  }));

  return (
    <ChartShell title="Goal Distribution" subtitle="Goals grouped by thrust area">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            label={({ name, percent }) => `${name?.slice(0, 12)}${name?.length > 12 ? '…' : ''} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
