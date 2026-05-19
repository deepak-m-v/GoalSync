import {
  LayoutDashboard,
  Target,
  Calendar,
  CheckSquare,
  Users,
  BarChart3,
  FileText,
  Shield,
  ClipboardList,
  FileBarChart,
} from 'lucide-react';

export const employeeNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/goals', label: 'My Goals', icon: Target },
  { to: '/quarterly', label: 'Quarterly Check-in', icon: Calendar },
];

export const managerNav = [
  { to: '/manager/approvals', label: 'Goal Approvals', icon: CheckSquare },
  { to: '/manager/team', label: 'Team Overview', icon: Users },
  { to: '/manager/checkins', label: 'Check-in Review', icon: ClipboardList },
];

export const adminNav = [
  { to: '/admin', label: 'Admin Panel', icon: Shield },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/audit', label: 'Audit Logs', icon: FileText },
];

export function getNavForRole(role) {
  let items = [...employeeNav];
  if (role === 'manager' || role === 'admin') items = [...items, ...managerNav];
  if (role === 'admin') items = [...items, ...adminNav];
  return items;
}
