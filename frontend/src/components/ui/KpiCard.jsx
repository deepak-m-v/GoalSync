import { motion } from 'framer-motion';

const accents = {
  blue: { border: 'border-l-blue-500', icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  green: { border: 'border-l-emerald-500', icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  orange: { border: 'border-l-orange-500', icon: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  purple: { border: 'border-l-purple-500', icon: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
};

export default function KpiCard({ label, value, subtext, icon: Icon, accent = 'green', delay = 0 }) {
  const a = accents[accent] || accents.green;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`card border-l-4 ${a.border} p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${a.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
