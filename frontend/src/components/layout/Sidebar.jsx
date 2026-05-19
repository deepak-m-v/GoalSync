import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNavForRole } from '../../constants/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = getNavForRole(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 lg:static">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-bold text-white shadow-sm">
          GS
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">GoalSync</p>
          <p className="text-xs text-slate-500">Enterprise HRMS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-active' : 'nav-item')}
          >
            {({ isActive }) => (
              <motion.span
                className="flex w-full items-center gap-3"
                whileHover={{ x: isActive ? 0 : 4 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-800">
        <button type="button" className="nav-item w-full">
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button type="button" onClick={handleLogout} className="nav-item w-full text-red-600 dark:text-red-400">
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
