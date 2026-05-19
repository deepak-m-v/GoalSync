export const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export const STATUS_COLORS = {
  approved: '#10b981',
  locked: '#8b5cf6',
  submitted: '#3b82f6',
  draft: '#94a3b8',
  rejected: '#ef4444',
  not_started: '#94a3b8',
  on_track: '#3b82f6',
  completed: '#10b981',
};

export const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  fontSize: 12,
};

export function formatStatus(label) {
  return String(label || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function heatColor(value) {
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 70) return 'bg-emerald-400';
  if (value >= 60) return 'bg-blue-400';
  if (value >= 50) return 'bg-amber-400';
  if (value > 0) return 'bg-orange-400';
  return 'bg-slate-200 dark:bg-slate-700';
}
