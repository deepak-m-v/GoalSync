import { Search, Bell, Moon, Sun, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="relative mx-auto w-full max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search goals, people, reports..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="btn-ghost relative rounded-full p-2.5" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button type="button" onClick={toggleTheme} className="btn-ghost rounded-full p-2.5" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 dark:border-slate-700 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              {user?.firstName?.[0]}
            </div>
            <div className="text-sm">
              <p className="font-medium leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="mt-0.5 text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
          </div>
          <Link to="/goals">
            <Button className="hidden sm:inline-flex">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
