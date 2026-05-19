import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
