import { useCallback, useEffect, useState } from 'react';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { Play, RefreshCw, Settings } from 'lucide-react';

function RuleCard({ rule }) {
  const cfg = rule.config || {};
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="font-medium">{rule.name}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${rule.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {rule.isEnabled ? 'On' : 'Off'}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{rule.description}</p>
      <p className="mt-2 text-xs text-slate-400">
        Manager {cfg.managerEscalationDays ?? 3}d · HR {cfg.hrEscalationDays ?? 7}d · Retries {cfg.maxRetries ?? 5}
      </p>
    </Card>
  );
}

export default function Escalations() {
  const [items, setItems] = useState([]);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/escalations'),
      api.get('/escalations/rules').catch(() => ({ data: { data: [] } })),
      api.get('/escalations/logs', { params: { limit: 20 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([esc, r, l]) => {
        setItems(esc.data.data || []);
        setRules(r.data.data || []);
        setLogs(l.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const runEngine = async () => {
    setRunning(true);
    try {
      const { data } = await api.post('/escalations/engine/run');
      setLastRun(data.data);
      load();
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={3} />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Escalation Management"
        subtitle="Employee → Manager → HR"
        action={
          <>
            <Button variant="secondary" onClick={load} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={runEngine} disabled={running} className="gap-2">
              <Play className="h-4 w-4" /> {running ? 'Running…' : 'Run engine'}
            </Button>
          </>
        }
      />

      {lastRun && (
        <Card className="text-sm border-l-4 border-l-emerald-500">
          Created {lastRun.created ?? 0} · Escalated {lastRun.escalated ?? 0} · Notified {lastRun.notified ?? 0}
        </Card>
      )}

      {rules.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><Settings className="h-5 w-5" /> Rules</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {rules.map((rule) => <RuleCard key={rule.id} rule={rule} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Escalations</h2>
        <div className="space-y-4">
          {items.map((e) => {
            const name = e.first_name ? `${e.first_name} ${e.last_name}` : `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.trim();
            return (
              <Card key={e.id}>
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{name || 'Unknown'}</span>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{e.level} · {e.type}: {e.reason || '—'}</p>
              </Card>
            );
          })}
          {items.length === 0 && <Card className="py-8 text-center text-slate-500">No escalations.</Card>}
        </div>
      </section>

      {logs.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">Recent logs</h2>
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50"><th className="px-4 py-2 text-left">Time</th><th className="px-4 py-2 text-left">Action</th><th className="px-4 py-2 text-left">Message</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={String(log.id)} className="border-b">
                    <td className="px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">{log.message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}
    </div>
  );
}
