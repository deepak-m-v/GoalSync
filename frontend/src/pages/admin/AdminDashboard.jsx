import { Link } from 'react-router-dom';
import { Shield, Users, FileBarChart, AlertTriangle, FileText, BarChart3 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

const modules = [
  { to: '/admin/users', icon: Users, title: 'User Management', desc: 'Manage employees, managers, and roles' },
  { to: '/admin/analytics', icon: BarChart3, title: 'Analytics', desc: 'KPIs, trends, and department performance' },
  { to: '/reports', icon: FileBarChart, title: 'Reports', desc: 'Export CSV reports and summaries' },
  { to: '/admin/audit', icon: FileText, title: 'Audit Logs', desc: 'Compliance and change history' },
  { to: '/admin/escalations', icon: AlertTriangle, title: 'Escalations', desc: 'Open workflow escalations' },
];

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Admin Panel" subtitle="HR governance, configuration, and organizational oversight" />

      <Card className="mb-6 flex items-center gap-4 border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10">
        <Shield className="h-10 w-10 text-emerald-600" />
        <div>
          <p className="font-semibold">Administrator Access</p>
          <p className="text-sm text-slate-500">Full access to users, analytics, reports, audit trails, and escalations.</p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="card-hover h-full">
              <m.icon className="mb-3 h-8 w-8 text-emerald-500" />
              <h3 className="font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{m.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
