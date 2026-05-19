import ChartShell from './ChartShell';
import { heatColor } from './chartTheme';

export default function PerformanceHeatmap({ heatmap }) {
  const { departments = [], quarters = [], values = [] } = heatmap || {};

  return (
    <ChartShell title="Performance Heatmap" subtitle="Department × quarter completion intensity (%)">
      <HeatmapGrid departments={departments} quarters={quarters} values={values} />
    </ChartShell>
  );
}

function HeatmapGrid({ departments, quarters, values }) {
  if (!departments.length) {
    return <p className="py-8 text-center text-sm text-slate-500">No heatmap data available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="pb-3 pr-3 text-left text-xs font-medium text-slate-500">Department</th>
            {quarters.map((q) => (
              <th key={q} className="pb-3 px-1 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                {q}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, ri) => (
            <tr key={dept}>
              <td className="py-1.5 pr-3 text-xs font-medium text-slate-700 dark:text-slate-300">{dept}</td>
              {(values[ri] || []).map((val, ci) => (
                <td key={`${ri}-${ci}`} className="p-1">
                  <div
                    className={`flex h-11 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-sm ${heatColor(val)}`}
                    title={`${dept} · ${quarters[ci]}: ${val}%`}
                  >
                    {val > 0 ? `${val}%` : '—'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Low</span>
        {['bg-orange-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400', 'bg-emerald-500'].map((c) => (
          <span key={c} className={`h-3 w-8 rounded ${c}`} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}
