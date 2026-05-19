import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import ChartShell from './ChartShell';

export default function CompletionGauge({ rate = 0, approved = 0, total = 0, trend = 0 }) {
  const data = [{ name: 'Completion', value: rate, fill: '#10b981' }];

  return (
    <ChartShell title="Goal Completion" subtitle={`${approved} of ${total} goals approved or locked`}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="100%"
            barSize={14}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: '#e2e8f0' }} dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">{rate}%</span>
          <span className="text-xs text-slate-500">completion rate</span>
          {trend !== 0 && (
            <span className={`mt-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}% vs last quarter
            </span>
          )}
        </div>
      </div>
    </ChartShell>
  );
}
