import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Calendar, Award, ArrowRight } from 'lucide-react';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { AreaChartCard } from '../../components/ui/ChartCard';
import Button from '../../components/ui/Button';

const progressData = [
  { name: 'Q1', progress: 72 },
  { name: 'Q2', progress: 58 },
  { name: 'Q3', progress: 45 },
  { name: 'Q4', progress: 20 },
];

export default function EmployeeDashboard() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/goals').then((res) => setGoals(res.data.data)).catch(() => setGoals([])).finally(() => setLoading(false));
  }, []);

  const totalWeight = goals.reduce((s, g) => s + parseFloat(g.weightage || 0), 0);
  const approved = goals.filter((g) => g.status === 'approved' || g.status === 'locked').length;

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Plan your best work — track goals and quarterly momentum"
        action={
          <Link to="/goals">
            <Button><Target className="h-4 w-4" /> Manage Goals</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Goals" value={goals.length} icon={Target} accent="green" delay={0} />
        <KpiCard label="Total Weightage" value={`${totalWeight}%`} subtext="Target: 100%" icon={TrendingUp} accent="blue" delay={0.05} />
        <KpiCard label="Approved Goals" value={approved} icon={Award} accent="purple" delay={0.1} />
        <KpiCard label="Current Quarter" value="Q2" subtext="FY 2026" icon={Calendar} accent="orange" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AreaChartCard title="Goal Progress Tracker" subtitle="Weighted completion by quarter" data={progressData} dataKey="progress" color="#10b981" />
        </div>
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent Goals</h3>
            <Link to="/goals" className="text-sm font-medium text-emerald-600 hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {goals.length === 0 ? (
              <p className="text-sm text-slate-500">No goals yet. Create your first goal to get started.</p>
            ) : (
              goals.slice(0, 5).map((g) => (
                <li key={g.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{g.title}</p>
                    <p className="text-xs text-slate-500">{g.weightage}% weight</p>
                  </div>
                  <StatusBadge status={g.status} />
                </li>
              ))
            )}
          </ul>
          <Link to="/quarterly" className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600">
            Update quarterly check-in <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
