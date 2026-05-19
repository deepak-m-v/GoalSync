import { useEffect, useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';

const UOM_TYPES = ['numeric', 'percentage', 'timeline', 'zero_based'];
const emptyGoal = { title: '', description: '', thrustArea: '', uomType: 'numeric', target: '', weightage: '', timeline: '' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [cycleId, setCycleId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyGoal);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([api.get('/goals'), api.get('/goals/cycle/active')])
      .then(([gRes, cRes]) => {
        setGoals(gRes.data.data);
        if (cRes.data.data?.id) setCycleId(cRes.data.data.id);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalWeight = goals.reduce((s, g) => s + parseFloat(g.weightage || 0), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', { ...form, cycleId, target: parseFloat(form.target), weightage: parseFloat(form.weightage) });
      toast.success('Goal created');
      setForm(emptyGoal);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/goals/submit', { cycleId });
      toast.success('Goal sheet submitted for approval');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Validation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      toast.success('Goal deleted');
      load();
    } catch {
      toast.error('Cannot delete this goal');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Goal Creation"
        subtitle={`Build your goal sheet — total weightage ${totalWeight}% / 100% (min 10% per goal, max 8 goals)`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Add Goal</Button>
            <Button onClick={handleSubmit} disabled={!goals.length}><Send className="h-4 w-4" /> Submit Sheet</Button>
          </div>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <input className="input-field sm:col-span-2" placeholder="Goal title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="input-field sm:col-span-2" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="input-field" placeholder="Thrust area" value={form.thrustArea} onChange={(e) => setForm({ ...form, thrustArea: e.target.value })} />
            <select className="input-field" value={form.uomType} onChange={(e) => setForm({ ...form, uomType: e.target.value })}>
              {UOM_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <input className="input-field" type="number" placeholder="Target *" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required />
            <input className="input-field" type="number" placeholder="Weightage % (min 10) *" min={10} max={100} value={form.weightage} onChange={(e) => setForm({ ...form, weightage: e.target.value })} required />
            <input className="input-field" type="date" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">Save Goal</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => (
          <Card key={g.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{g.title}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{g.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{g.uom_type || g.uomType}</span>
                  <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30">{g.weightage}%</span>
                  <StatusBadge status={g.status} />
                </div>
              </div>
              {g.status === 'draft' && !g.is_locked && (
                <button type="button" onClick={() => handleDelete(g.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
      {goals.length === 0 && !showForm && (
        <Card className="py-12 text-center text-slate-500">No goals yet. Click &quot;Add Goal&quot; to start your sheet.</Card>
      )}
    </div>
  );
}
