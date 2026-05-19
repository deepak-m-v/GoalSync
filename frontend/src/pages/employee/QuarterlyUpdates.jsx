import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const STATUSES = ['not_started', 'on_track', 'completed'];

export default function QuarterlyUpdates() {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [quarter, setQuarter] = useState('Q2');
  const [form, setForm] = useState({ plannedValue: '', actualValue: '', progressStatus: 'on_track', employeeNotes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/goals').then((res) => {
      const approved = res.data.data.filter((g) => ['approved', 'locked'].includes(g.status));
      setGoals(approved);
      if (approved[0]) setSelectedGoal(approved[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selectedGoal) return toast.error('Select a goal');
    try {
      await api.put(`/check-ins/goals/${selectedGoal}`, { quarter, ...form, plannedValue: parseFloat(form.plannedValue) || null, actualValue: parseFloat(form.actualValue) || null });
      toast.success(`${quarter} check-in saved`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader title="Quarterly Check-in" subtitle="Update planned vs actual achievements each quarter" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-4 font-semibold">Select Goal</h3>
          <ul className="space-y-2">
            {goals.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setSelectedGoal(g.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${selectedGoal === g.id ? 'bg-emerald-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {g.title}
                </button>
              </li>
            ))}
            {goals.length === 0 && <p className="text-sm text-slate-500">No approved goals for check-ins.</p>}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-6 flex flex-wrap gap-2">
            {QUARTERS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuarter(q)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${quarter === q ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Planned value</label>
              <input className="input-field" type="number" value={form.plannedValue} onChange={(e) => setForm({ ...form, plannedValue: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Actual value</label>
              <input className="input-field" type="number" value={form.actualValue} onChange={(e) => setForm({ ...form, actualValue: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <select className="input-field" value={form.progressStatus} onChange={(e) => setForm({ ...form, progressStatus: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Notes</label>
              <textarea className="input-field" rows={3} value={form.employeeNotes} onChange={(e) => setForm({ ...form, employeeNotes: e.target.value })} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <StatusBadge status={form.progressStatus} />
            <Button onClick={handleSave}>Save Check-in</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
