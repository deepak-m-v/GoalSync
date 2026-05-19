const styles = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  submitted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  locked: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  not_started: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
  on_track: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40',
  open: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40',
};

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase?.() || 'draft';
  return (
    <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${styles[key] || styles.draft}`}>
      {String(status || '').replace(/_/g, ' ')}
    </span>
  );
}
