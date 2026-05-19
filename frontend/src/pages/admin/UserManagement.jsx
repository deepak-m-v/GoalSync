import { useEffect, useState } from 'react';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const name = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase();
    return name.includes(search.toLowerCase()) && (!roleFilter || u.role === roleFilter);
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader title="User Management" subtitle="Employees, managers, and administrators" />
      <DataTable
        columns={[
          { key: 'name', label: 'Name', render: (r) => `${r.first_name} ${r.last_name}` },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (r) => <StatusBadge status={r.role} /> },
          { key: 'department', label: 'Department', render: (r) => r.department || '—' },
        ]}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        filters={
          <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="employee">employee</option>
            <option value="manager">manager</option>
            <option value="admin">admin</option>
          </select>
        }
      />
    </div>
  );
}
