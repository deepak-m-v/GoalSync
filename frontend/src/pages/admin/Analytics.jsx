import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Target, AlertTriangle, TrendingUp, Activity, RefreshCw, Database,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import KpiCard from '../../components/ui/KpiCard';
import Button from '../../components/ui/Button';
import { PieChartCard, BarChartCard } from '../../components/ui/ChartCard';
import { fetchAnalyticsOverview } from '../../services/analyticsApi';
import CompletionGauge from '../../components/analytics/CompletionGauge';
import TeamPerformanceChart from '../../components/analytics/TeamPerformanceChart';
import DepartmentPerformanceChart from '../../components/analytics/DepartmentPerformanceChart';
import QuarterlyTrendsChart from '../../components/analytics/QuarterlyTrendsChart';
import PerformanceHeatmap from '../../components/analytics/PerformanceHeatmap';
import ManagerEffectivenessChart from '../../components/analytics/ManagerEffectivenessChart';
import GoalDistributionChart from '../../components/analytics/GoalDistributionChart';
import StatusAnalyticsChart from '../../components/analytics/StatusAnalyticsChart';
import { formatStatus } from '../../components/analytics/chartTheme';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  const load = useCallback(async (demo = false) => {
    setLoading(true);
    try {
      const overview = await fetchAnalyticsOverview(demo ? { demo: 'true' } : {});
      setData(overview);
      setDemoMode(overview.source === 'demo' || demo);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSkeleton />;

  const kpis = data?.kpis || {};
  const completion = data?.completion || {};
  const pieData = (data?.goalsByStatus || []).map((g) => ({
    name: formatStatus(g.status),
    value: g.count,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Organization-wide goal performance, trends, and team insights"
        action={
          <>
            {data?.source && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  data.source === 'live'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                {data.source === 'live' ? 'Live data' : data.source === 'mixed' ? 'Mixed' : 'Demo data'}
              </span>
            )}
            <Button variant="secondary" onClick={() => load(false)} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => load(true)} className="gap-2">
              Load demo
            </Button>
          </>
        }
      />

      {demoMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
        >
          Showing demo analytics — connect your database or seed goals for live metrics.
        </motion.div>
      )}

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          <KpiCard label="Active Users" value={kpis.totalUsers ?? data?.totalUsers ?? '—'} icon={Users} accent="blue" delay={0} />
          <KpiCard label="Total Goals" value={kpis.totalGoals ?? '—'} icon={Target} accent="green" delay={0.05} />
          <KpiCard label="Goal Completion" value={`${kpis.completionRate ?? completion.rate ?? 0}%`} icon={BarChart3} accent="green" delay={0.1} />
          <KpiCard label="On Track" value={`${kpis.onTrackRate ?? 0}%`} icon={Activity} accent="blue" delay={0.15} />
          <KpiCard label="Avg Progress" value={`${kpis.avgProgressScore ?? 0}%`} icon={TrendingUp} accent="purple" delay={0.2} />
          <KpiCard label="Open Escalations" value={kpis.openEscalations ?? data?.openEscalations ?? 0} icon={AlertTriangle} accent="orange" delay={0.25} subtext={`${kpis.pendingApprovals ?? data?.pendingApprovals ?? 0} pending approvals`} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <CompletionGauge
          rate={completion.rate ?? kpis.completionRate ?? 0}
          approved={completion.approved ?? 0}
          total={completion.total ?? kpis.totalGoals ?? 0}
          trend={completion.trend ?? 0}
        />
        <div className="lg:col-span-2">
          <QuarterlyTrendsChart data={data?.quarterlyTrends || []} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TeamPerformanceChart data={data?.teamPerformance || []} />
        <DepartmentPerformanceChart data={data?.departmentPerformance || []} />
      </section>

      <section>
        <PerformanceHeatmap heatmap={data?.heatmap} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ManagerEffectivenessChart data={data?.managerEffectiveness || []} />
        <GoalDistributionChart data={data?.goalDistribution || []} />
      </section>

      <section>
        <StatusAnalyticsChart
          statusAnalytics={data?.statusAnalytics || []}
          checkInStatus={data?.checkInStatus || []}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PieChartCard
          title="Goals by Status"
          data={pieData.length ? pieData : [{ name: 'No data', value: 1 }]}
        />
        <BarChartCard
          title="Goals per Department"
          data={data?.departmentStats || []}
          dataKey="goal_count"
          xKey="name"
        />
      </section>
    </div>
  );
}
