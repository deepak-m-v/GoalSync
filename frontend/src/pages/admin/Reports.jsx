import { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const reports = [
  { id: 'planned', title: 'Planned vs Actual', endpoint: '/reports/planned-vs-actual', desc: 'Quarterly planned vs actual by goal' },
  { id: 'completion', title: 'Employee Completion', endpoint: '/reports/employee-completion', desc: 'Goal completion rate by employee' },
  { id: 'quarterly', title: 'Quarterly Summary', endpoint: '/reports/quarterly-summary', desc: 'Aggregated quarterly progress' },
];

export default function Reports() {
  const [active, setActive] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async (report) => {
    setLoading(true);
    setActive(report);
    try {
      const res = await api.get(report.endpoint);
      setRows(res.data.data || []);
    } catch {
      toast.error('Failed to load report');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async (report) => {
    try {
      const res = await api.get(`${report.endpoint}?format=csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.id}.csv`;
      a.click();
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const columns = rows[0]
    ? Object.keys(rows[0]).map((k) => ({ key: k, label: k.replace(/_/g, ' ') }))
    : [];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export organizational reports" />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.id} className={`cursor-pointer transition ring-2 ${active?.id === r.id ? 'ring-emerald-500' : 'ring-transparent hover:ring-emerald-200'}`}>
            <h3 className="font-semibold">{r.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{r.desc}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => loadReport(r)}>Preview</Button>
              <Button onClick={() => exportCsv(r)}><Download className="h-4 w-4" /> CSV</Button>
            </div>
          </Card>
        ))}
      </div>

      {loading && <LoadingSkeleton rows={2} />}
      {!loading && active && rows.length > 0 && (
        <DataTable columns={columns} data={rows} emptyMessage="No data" />
      )}
    </div>
  );
}
