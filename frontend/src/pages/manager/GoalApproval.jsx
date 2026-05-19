import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import DataTable from '../../components/ui/DataTable';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import KpiCard from '../../components/ui/KpiCard';
import { Users, Clock, CheckCircle } from 'lucide-react';

export default function GoalApproval() {
  const [searchParams] = useSearchParams();
  const [approvals, setApprovals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [goals, setGoals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/manager/approvals').then((res) => setApprovals(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/approvals/${id}`);
      setSelected(res.data.data);
      setGoals(res.data.data.goals || []);
    } catch {
      const approval = approvals.find((a) => a.id === id);
      setSelected({ approval, goals: [] });
    }
  };

  useEffect(() => {
    const approvalId = searchParams.get('approvalId');
    if (approvalId && !loading) {
      openDetail(parseInt(approvalId, 10));
    }
  }, [searchParams, loading]);

  const review = async (id, status) => {
    try {
      await api.post(`/manager/approvals/${id}/review`, { status, comments: '' });
      toast.success(`Goals ${status}`);
      setSelected(null);
      load();
    } catch {
      toast.error('Review failed');
    }
  };

  const filtered = approvals.filter((a) => {
    const name = `${a.first_name || a.user?.firstName} ${a.last_name || a.user?.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader title="Manager Approval" subtitle="Review submitted goal sheets from your team" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Pending" value={approvals.length} icon={Clock} accent="orange" />
        <KpiCard label="Team Members" value="—" icon={Users} accent="blue" />
        <KpiCard label="Approved Today" value="—" icon={CheckCircle} accent="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DataTable
            columns={[
              { key: 'name', label: 'Employee', render: (r) => `${r.first_name} ${r.last_name}` },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              {
                key: 'action',
                label: '',
                render: (r) => (
                  <button type="button" onClick={() => openDetail(r.id)} className="text-sm font-medium text-emerald-600 hover:underline">
                    Review
                  </button>
                ),
              },
            ]}
            data={filtered}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search employee..."
          />
        </div>

        <Card className="lg:col-span-3">
          {selected ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  {selected.approval?.user?.firstName || selected.first_name} {selected.approval?.user?.lastName || selected.last_name}
                </h3>
                <div className="flex gap-2">
                  <Button onClick={() => review(selected.approval?.id || selected.id, 'approved')}><Check className="h-4 w-4" /> Approve</Button>
                  <Button variant="secondary" onClick={() => review(selected.approval?.id || selected.id, 'rejected')}><X className="h-4 w-4" /> Reject</Button>
                </div>
              </div>
              <ul className="space-y-3">
                {(goals.length ? goals : []).map((g) => (
                  <li key={g.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-sm text-emerald-600">{g.weightage}%</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{g.description}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="py-12 text-center text-slate-500">Select an employee to review their goal sheet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
