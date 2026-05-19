import PageHeader from '../../components/ui/PageHeader';

export default function GoalHistory() {
  return (
    <div>
      <PageHeader title="Goal History" subtitle="View past cycles and archived goal sheets" />
      <div className="glass-card p-8 text-center text-slate-500">
        Historical goal data will appear here once prior cycles are completed.
      </div>
    </div>
  );
}
