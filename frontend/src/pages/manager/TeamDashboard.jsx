import { useEffect, useState } from 'react';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';

export default function TeamDashboard() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/manager/team').then((res) => setTeam(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader title="Team Overview" subtitle="Direct reports and their goal status" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-900/40">
                {m.first_name?.[0]}
              </div>
              <div>
                <p className="font-semibold">{m.first_name} {m.last_name}</p>
                <p className="text-sm text-slate-500">{m.email}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span>{m.goal_count} goals</span>
              <StatusBadge status={m.approval_status || 'draft'} />
            </div>
          </Card>
        ))}
        {team.length === 0 && <Card className="col-span-full py-8 text-center text-slate-500">No team members assigned.</Card>}
      </div>
    </div>
  );
}
