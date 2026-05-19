import { useEffect, useState } from 'react';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs').then((res) => setLogs(res.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const matchSearch = !search || log.entity_type?.toLowerCase().includes(search.toLowerCase()) || log.action?.toLowerCase().includes(search.toLowerCase());
    const matchEntity = !entityFilter || log.entity_type === entityFilter;
    return matchSearch && matchEntity;
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Who changed what and when — compliance trail" />

      <DataTable
        columns={[
          { key: 'action', label: 'Action', render: (r) => <StatusBadge status={r.action} /> },
          { key: 'entity_type', label: 'Entity' },
          { key: 'entity_id', label: 'ID' },
          {
            key: 'user',
            label: 'User',
            render: (r) => r.first_name ? `${r.first_name} ${r.last_name}` : r.email || '—',
          },
          {
            key: 'created_at',
            label: 'Timestamp',
            render: (r) => new Date(r.created_at).toLocaleString(),
          },
        ]}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search action or entity..."
        filters={
          <select className="input-field w-auto" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
            <option value="">All entities</option>
            <option value="goal">goal</option>
            <option value="goal_approval">goal_approval</option>
            <option value="check_in">check_in</option>
            <option value="user">user</option>
          </select>
        }
      />
    </div>
  );
}
